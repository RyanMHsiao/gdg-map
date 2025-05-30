// The camera controls transformations to make sure everything is
// displayed with the correct positioning on the map
// All the code here assumes that the distortion for the curvature
// of the Earth is already handled by the cartography file
// Written by Ryan Hsiao

import { Compass } from "./compass.mjs";
import { AffineTransformationMatrix, distance } from "./cameramath.mjs";
import { addCameraListeners, mergeLeft } from "./camerautils.mjs";

class Camera {
	affine;

	// Note that we will immediately apply all transformations
	// This can be changed for optimization if needed
	ctx;
	// Compass is here so that we can link it to the canvas transformations
	compass;
	// For rendering to look at
	floor;

	constructor(ctx, skipCompass) {
		this.affine = new AffineTransformationMatrix();
		this.ctx = ctx;
		if (!skipCompass) {
			this.compass = new Compass(Math.PI / 2, this);
		}
	}

	// x and y are change in pointer position in pixels
	translate(x, y) {
		this.affine.translate(x, y);
	}

	// relativeScale is how much to scale relative to previous scale
	// x and y are the center of the scale in pixels
	scale(relativeScale, x, y, minScale = 0.125, maxScale = 4) {
		let newScale = this.affine.scaleFactor * relativeScale;
		newScale = Math.min(Math.max(minScale, newScale), maxScale);
		// Change value if newScale got clamped
		relativeScale = newScale / this.affine.scaleFactor;
		this.affine.scaleFromPoint(newScale, relativeScale, x, y);
	}

	// delta is an angle in radians (clockwise)
	// x and y are the center of the rotation in pixels
	// skipCompass skips updating the compass if rotation is called from compass
	rotate(delta, x, y, skipCompass) {
		this.affine.rotate(delta, x, y);
		if (!skipCompass) {
			this.compass.updateRotation(Math.PI/2 - this.affine.theta);
		}
	}

	// Helper function to convert coordinates like offsetX, offsetY
	// to x and y values on the canvas accounting for transformations
	screenToWorld(x, y) {
		return this.affine.screenToWorld(x, y);
	}

	// Inverse of screenToWorld
	worldToScreen(x, y) {
		return this.affine.worldToScreen(x, y);
	}

	// Translates to shift the center of the screen to a given world value
	// We can add more functionality later like smooth transition and zooming
	setCenterOn(x, y) {
		[x, y] = this.worldToScreen(x, y);
		this.translate(window.innerWidth / 2 - x, window.innerHeight / 2 - y);
	}

	// Sets the transformation to what the basemap expects
	refreshTransform() {
		this.affine.applyTransform(this.ctx);
	}


	// Sets the transform two make two points on the world
	// match up with two new points
	// Imagine a staple fixing a new paper above the map
	// using two points of contact, except the staple
	// is capable of stretching
	// The first four arguments are corners on the map
	// and the last four arguments are corners on the new plane
	staple(worldX1, worldY1, worldX2, worldY2, x3, y3, x4, y4) {
		let oldAffine = this.affine;
		let [x1, y1] = this.worldToScreen(worldX1, worldY1);
		let [x2, y2] = this.worldToScreen(worldX2, worldY2);
		this.ctx.resetTransform();
		this.affine = new AffineTransformationMatrix();
		this.translate(x1 - x3, y1 - y3);
		this.scale(distance(x1, y1, x2, y2) / distance(x3, y3, x4, y4), x1, y1, 0, Infinity);
		this.rotate(Math.atan2(x4 - x3, y4 - y3) - Math.atan2(x2 - x1, y2 - y1), x1, y1, true);
		this.refreshTransform();
		this.affine = oldAffine;
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

export { Camera, addCameraListeners, mergeLeft };
