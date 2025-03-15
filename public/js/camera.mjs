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
		this.affine.scale(relativeScale, x, y, minScale, maxScale);
		this.ctx.setTransform(...this.affine.transform);
	}

	// delta is an angle in radians (clockwise)
	// x and y are the center of the rotation in pixels
	// skipCompass skips updating the compass if rotation is called from compass
	rotate(delta, x, y, skipCompass) {
		this.affine.rotate(delta, x, y, skipCompass);
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
		this.affine.setCenterOn(x, y);
	}

	// Sets the transformation to what the basemap expects
	refreshTransform() {
		this.ctx.setTransform(...this.affine.transform);
	}

	staple(worldX1, worldY1, worldX2, worldY2, x3, y3, x4, y4) {
		this.affine.staple(worldX1, worldY1, worldX2, worldY2, x3, y3, x4, y4, this);
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
