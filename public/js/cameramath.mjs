// The purpose of this file is to abstract away most of the math
// Read up on affine transformations to help you understand it
// Written by Ryan Hsiao, so ask me if you need help

class AffineTransformationMatrix {
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

	constructor() { }

	// x and y are change in pointer position in pixels
	translate(x, y) {
		this.transform[4] += x;
		this.transform[5] += y;
	}

	// relativeScale is how much to scale relative to previous scale
	// x and y are the center of the scale in pixels
	scale(relativeScale, x, y, minScale = 0.125, maxScale = 4) {
		let newScale = this.scaleFactor * relativeScale;
		newScale = Math.min(Math.max(minScale, newScale), maxScale);
		// Change value if newScale got clamped
		relativeScale = newScale / this.scaleFactor;
		for (let i = 0; i < 6; ++i) {
			this.transform[i] *= relativeScale;
		}
		// At this point, we have kept the top left of the screen a fixed point
		// We just translate a little more to keep the pointer position fixed
		let centerFactor = 1 - relativeScale;
		this.translate(x * centerFactor, y * centerFactor);
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

	// Sets the transform two make two points on the world
	// match up with two new points
	// Imagine a staple fixing a new paper above the map
	// using two points of contact, except the staple
	// is capable of stretching
	// The first four arguments are corners on the map
	// and the last four arguments are corners on the new plane
	staple(worldX1, worldY1, worldX2, worldY2, x3, y3, x4, y4, camera) {
		let initTransform = this.transform;
		let initScaleFactor = this.scaleFactor;
		let initTheta = this.theta;

		let [x1, y1] = this.worldToScreen(worldX1, worldY1);
		let [x2, y2] = this.worldToScreen(worldX2, worldY2);
		camera.ctx.resetTransform();
		this.transform = [1, 0, 0, 1, 0, 0];
		this.scaleFactor = 1;
		this.theta = 0;
		this.translate(x1 - x3, y1 - y3);
		this.scale(distance(x1, y1, x2, y2) / distance(x3, y3, x4, y4), x1, y1, 0, Infinity);
		this.rotate(-Math.atan2(x2 - x1, y2 - y1) + Math.atan2(x4 - x3, y4 - y3), x1, y1, true);
		camera.refreshTransform();

		this.transform = initTransform;
		this.scaleFactor = initScaleFactor;
		this.theta = initTheta;
	}

	// Strokes and fills in text at a given position
	writeText(text, worldX, worldY) {
		// Calling resetTransform a bunch probably isn't a performance concern,
		// but if it is it's not too hard to refactor repetitive calls away
		this.ctx.resetTransform();
		let [x, y] = this.worldToScreen(worldX, worldY);
		this.ctx.strokeText(text, x, y);
		this.ctx.fillText(text, x, y);
	}
}

// Simple Euclidean distance between two points
function distance(x1, y1, x2, y2) {
	let dx = x1 - x2;
	let dy = y1 - y2;
	return Math.sqrt(dx * dx + dy * dy);
}

export { AffineTransformationMatrix, distance };
