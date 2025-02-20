// The purpose of this file is to abstract away most of the math
// Read up on affine transformations to help you understand it
// Written by Ryan Hsiao, so ask me if you need help

export class Camera {
	// Note that we will immediately apply all transformations
	// This can be changed for optimization if needed
	ctx;

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

	constructor(ctx) {
		this.ctx = ctx;
	}

	// x and y are change in pointer position in pixels
	translate(x, y) {
		this.transform[4] += x;
		this.transform[5] += y;
		this.ctx.setTransform(...this.transform);
	}

	// delta is a scale amount tuned for the wheel event
	// x and y are the center of the scale in pixels
	scale(delta, x, y) {
		// TODO Change constants to something configurable
		let newScale = this.scaleFactor + delta * -0.0001;
		newScale = Math.min(Math.max(0.125, newScale), 4);
		let relativeScale = newScale / this.scaleFactor;
		for (let i = 0; i < 6; ++i) {
			this.transform[i] *= relativeScale;
		}
		// At this point, we have kept the top left of the screen a fixed point
		// We just translate a little more to keep the pointer position fixed
		let centerFactor = 1 - relativeScale;
		// The this.translate call also sets transform for us
		this.translate(x * centerFactor, y * centerFactor);
		this.ctx.setTransform(...this.transform);
		this.scaleFactor = newScale;
	}

	tempRotate(deltaTheta) {
		this.theta += deltaTheta;
		this.transform[0] = this.scaleFactor * Math.cos(this.theta);
		this.transform[1] = this.scaleFactor * Math.sin(this.theta);
		this.transform[2] = -this.transform[1];
		this.transform[3] = this.transform[0];
		this.ctx.setTransform(...this.transform);
	}

	// Helper function to convert coordinates like offsetX, offsetY
	// to x and y values on the canvas accounting for transformations
	screenToWorld(x, y) {
		x -= this.transform[4];
		y -= this.transform[5];
		x /= this.scaleFactor;
		y /= this.scaleFactor;
		return [x, y];
	}
}
