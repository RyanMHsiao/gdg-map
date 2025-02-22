// Written by Ryan Hsiao, kind of inelegant but it works
// TODO Make this elegant

// Angles are in clockwise radians from East
const naturalTheta = Math.PI;

export class Compass {
	// jQuery element
	element;

	theta;

	constructor(theta) {
		this.element = $("#compass");
		this.theta = theta;
		this.updateRotation();
	}

	updateRotation() {
		this.element.css({"transform": `rotate(${naturalTheta-this.theta}rad)`});
	}
}
