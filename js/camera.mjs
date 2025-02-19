// The purpose of this file is to abstract away most of the math
// Read up on affine transformations to help you understand it
// Written by Ryan Hsiao, so ask me if you need help
export class Camera {
	ctx;

	translateX = 0;
	translateY = 0;

	scaleFactor = 1;

	constructor(ctx) {
		this.ctx = ctx;
	}

	translate(x, y) {
		let scaledX = x / this.scaleFactor;
		let scaledY = y / this.scaleFactor;
		// Translate based only on the change
		this.ctx.translate(scaledX, scaledY);
		// Store cumulative change for scales and rotates
		this.translateX += scaledX;
		this.translateY += scaledY;
	}

	scale(delta, x, y) {
		let prevScaleFactor = this.scaleFactor;
		let prevTranslateX = this.translateX;
		let prevTranslateY = this.translateY;
		[x, y] = this.screenToWorld(x, y);
		// Calculate the new scale factor
		this.scaleFactor += delta * -0.01;
		this.scaleFactor = Math.min(Math.max(0.125, this.scaleFactor), 4);
		console.log(prevScaleFactor, this.scaleFactor, x, y);
		// Reset and scale centered on origin
		this.ctx.resetTransform();
		this.ctx.scale(this.scaleFactor, this.scaleFactor);
		// Adjust offsets for new scale and translate
		this.translateX *= prevScaleFactor / this.scaleFactor;
		this.translateY *= prevScaleFactor / this.scaleFactor;
		// Right now, the origin is a fixed point
		// Now we translate further so the mouse position is fixed
		this.translateX -= x * (1 - prevScaleFactor / this.scaleFactor);
		this.translateY -= y * (1 - prevScaleFactor / this.scaleFactor);
		this.ctx.translate(this.translateX, this.translateY);
	}

	// Helper function to convert coordinates like offsetX, offsetY
	// to x and y values on the canvas accounting for transformations
	screenToWorld(x, y) {
		x -= this.translateX * this.scaleFactor;
		y -= this.translateY * this.scaleFactor;
		x /= this.scaleFactor;
		y /= this.scaleFactor;
		return [x, y];
	}
}
