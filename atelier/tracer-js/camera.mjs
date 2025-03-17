// The camera controls transformations to make sure everything is
// displayed with the correct positioning on the map
// All the code here assumes that the distortion for the curvature
// of the Earth is already handled by the cartography file
// Written by Ryan Hsiao

import { AffineTransformationMatrix, distance } from "./cameramath.mjs";
import { addCameraListeners, mergeLeft } from "./camerautils.mjs";

class Camera {
	affine;

	// Note that we will immediately apply all transformations
	// This can be changed for optimization if needed
	ctx;
	// Compass is here so that we can link it to the canvas transformations
	compass;

	constructor(ctx, skipCompass) {
		this.affine = new AffineTransformationMatrix();
		this.ctx = ctx;
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
