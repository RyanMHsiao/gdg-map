// The purpose of this file is to abstract away most of the math
// Read up on affine transformations to help you understand it
// Written by Ryan Hsiao, so ask me if you need help

// Compass stuff. The organization is weird, hopefully it makes sense to place it here
import { Compass } from "./compass.mjs";

class Camera {
	// Affine transformation matrix
	// ( a c e ) ( x )
	// ( b d f ) ( y )
	// ( 0 0 1 ) ( 1 )
	// More info here: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
	transform = [1, 0, 0, 1, 0, 0];
	// Our transformations should always preserve angles,
	// so we have a meaningful scale and theta
	scaleFactor = 1;
	// theta is a clockwise angle measured in radians
	theta = 0;

	// Note that we will immediately apply all transformations
	// This can be changed for optimization if needed
	ctx;
	// Compass is here so that we can link it to the canvas transformations
	compass;

	constructor(ctx, skipCompass) {
		this.ctx = ctx;
		if (!skipCompass) {
			this.compass = new Compass(Math.PI / 2, this);
		}
	}

	// x and y are change in pointer position in pixels
	translate(x, y) {
		this.transform[4] += x;
		this.transform[5] += y;
	}

	// relativeScale is how much to scale relative to previous scale
	// x and y are the center of the scale in pixels
	scale(relativeScale, x, y) {
		let newScale = this.scaleFactor * relativeScale;
		// TODO Make scale limits configurable
		newScale = Math.min(Math.max(0.125, newScale), 4);
		// Change value if newScale got clamped
		relativeScale = newScale / this.scaleFactor;
		for (let i = 0; i < 6; ++i) {
			this.transform[i] *= relativeScale;
		}
		// At this point, we have kept the top left of the screen a fixed point
		// We just translate a little more to keep the pointer position fixed
		let centerFactor = 1 - relativeScale;
		this.translate(x * centerFactor, y * centerFactor);
		this.ctx.setTransform(...this.transform);
		this.scaleFactor = newScale;
	}

	// delta is an angle in radians (clockwise)
	// x and y are the center of the rotation in pixels
	// skipCompass skips updating the compass if rotation is called from compass
	rotate(delta, x, y, skipCompass) {
		// We efficiently multiply rotation and scale matrix
		this.theta += delta;
		this.transform[0] = this.scaleFactor * Math.cos(this.theta);
		this.transform[1] = this.scaleFactor * Math.sin(this.theta);
		this.transform[2] = -this.transform[1];
		this.transform[3] = this.transform[0];
		// Room for optimization with algebra and geometry if necessary
		let relX = x - this.transform[4];
		let relY = y - this.transform[5];
		let rho = Math.sqrt(relX*relX + relY*relY);
		let phiPrime = Math.atan2(relY, relX) + delta;
		// rho is at angle phi from the +x axis
		// delta is the same for rho and theta
		// since both start from the same point (the origin)
		// We can use this fact to calculate how much we need to translate
		this.translate(relX - Math.cos(phiPrime) * rho, relY - Math.sin(phiPrime) * rho);
		if (!skipCompass) {
			this.compass.updateRotation(Math.PI/2 - this.theta);
		}
	}

	// Helper function to convert coordinates like offsetX, offsetY
	// to x and y values on the canvas accounting for transformations
	screenToWorld(x, y) {
		x -= this.transform[4];
		y -= this.transform[5];
		x /= this.scaleFactor;
		y /= this.scaleFactor;
		return [
			x * Math.cos(this.theta) + y * Math.sin(this.theta),
			y * Math.cos(this.theta) - x * Math.sin(this.theta)
		];
	}

	// Inverse of screenToWorld
	worldToScreen(x, y) {
		// Using linear algebra to apply affine transformation
		let result = [this.transform[4], this.transform[5]];
		for (let i = 0; i < 2; ++i) {
			result[i] += x * this.transform[i];
			result[i] += y * this.transform[2 + i];
		}
		return result;
	}

	// Translates to shift the center of the screen to a given world value
	// We can add more functionality later like smooth transition and zooming
	setCenterOn(x, y) {
		[x, y] = this.worldToScreen(x, y);
		this.translate(window.innerWidth / 2 - x, window.innerHeight / 2 - y);
	}

	// Sets the transformation to what the basemap expects
	refreshTransform() {
		this.ctx.setTransform(...this.transform);
	}

	staple(x1, y1, x2, y2, x3, y3, x4, y4) {
		[x1, y1] = this.worldToScreen(x1, y1);
		[x2, y2] = this.worldToScreen(x2, y2);
		this.ctx.resetTransform();
		this.ctx.resetTransform();
		this.ctx.fillStyle = "blue";
		this.ctx.translate(x1 - x3, y1 - y3);
		this.ctx.fillRect(x3, y3, 100, 100);
	}
}

function addTransformListeners(camera) {
	// Adding a scroll wheel based zoom
	// Not supported on all browsers, add buttons as alternative
	$("#canvas").on("wheel", function (event) {
		// TODO Change formula to feel smoother, probably exponential
		let scaleFactor = 1 + event.originalEvent.deltaY * -0.0004
		camera.scale(scaleFactor, event.offsetX, event.offsetY);
		draw();
	});
	// Using Hammer.js for touch events and mouse panning
	let mc = new Hammer.Manager($("#canvas")[0], {
		recognizers: [
			[Hammer.Rotate],
			[Hammer.Pinch, {}, ['rotate']],
			[Hammer.Pan, {threshold: 0}]
		]
	});

	// TODO Fix erratic behavior when releasing from 2 pointers to 1
	// This has been mitigated, but this can still happen if you try this:
	// One finger starts panning upwards
	// Simultaneously stop that finger in place and add another finger moving upwards
	// Release both fingers at once
	// This causes a jump in the panning.
	// Hammer.js gives us the cumulative delta, so we need to differentiate
	let prevPanX, prevPanY;
	mc.on("panstart", function (event) {
		//console.log("panstart");
		prevPanX = event.deltaX;
		prevPanY = event.deltaY;
	});
	mc.on("pan", function (event) {
		if (prevPanX !== null) {
			//console.log("pan");
			camera.translate(event.deltaX - prevPanX, event.deltaY - prevPanY);
			draw();
			prevPanX = event.deltaX;
			prevPanY = event.deltaY;
		} else {
			//console.log("failed pan");
		}
	});
	mc.on("panend", function (event) {
		//console.log("panend");
		prevPanX = prevPanY = null;
	});

	let prevRotate;
	mc.on("rotatestart", function (event) {
		prevRotate = event.rotation;
	});
	mc.on("rotate", function (event) {
		let phi = Math.PI * (event.rotation - prevRotate) / 180;
		camera.rotate(phi, event.center.x, event.center.y);
		draw();
		prevRotate = event.rotation;
	});

	let prevPinchScale;
	mc.on("pinchstart", function (event) {
		//console.log("pinchstart");
		prevPinchScale = event.scale;
	});
	mc.on("pinch", function (event) {
		//console.log("pinch");
		let relativeScale = event.scale / prevPinchScale;
		camera.scale(relativeScale, event.center.x, event.center.y);
		prevPinchScale = event.scale;
	});
	mc.on("pinchend", function (event) {
		//console.log("pinchend");
	});
}

export { Camera, addTransformListeners };
