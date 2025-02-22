// Written by Ryan Hsiao, kind of inelegant but it works
// TODO Make this elegant

// Angles are in clockwise radians from East
const naturalTheta = Math.PI;

export class Compass {
	// jQuery element
	element;
	mc;

	theta;

	constructor(theta) {
		this.element = $("#compass");
		this.updateRotation(theta);
		this.mc = new Hammer.Manager(this.element[0], {
			recognizers: [
				[Hammer.Pan, {threshold: 0}]
			]
		});
		let jQueryElement = this.element;
		let captureThis = this;
		this.mc.on("pan", function (event) {
			console.log(event);
			let offset = jQueryElement.offset();
			let deltaY = event.srcEvent.y - offset.top - jQueryElement.height() / 2;
			let deltaX = event.srcEvent.x - offset.left - jQueryElement.width() / 2;
			// From clockwise angle to counterclockwise angle
			captureThis.updateRotation(Math.atan2(-deltaY, deltaX));
		});
	}

	updateRotation(theta) {
		this.theta = theta;
		this.element.css({"transform": `rotate(${naturalTheta-this.theta}rad)`});
	}
}
