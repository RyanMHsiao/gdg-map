// Written by Ryan Hsiao very hastily
// TODO Improve code style and readability

// Angles are in clockwise radians from East
const naturalTheta = Math.PI;

export class Compass {
	// jQuery element
	element;

	mc;
	camera

	theta;

	constructor(theta, camera) {
		this.element = $("#compass");
		this.updateRotation(theta);
		this.mc = new Hammer.Manager(this.element[0], {
			recognizers: [
				[Hammer.Pan, {threshold: 0}]
			]
		});
		let jQueryElement = this.element;
		let captureThis = this;
		this.camera = camera;
		this.mc.on("pan", function (event) {
			console.log(event);
			let prevTheta = captureThis.theta;
			let offset = jQueryElement.offset();
			let deltaY = event.srcEvent.y - offset.top - jQueryElement.height() / 2;
			let deltaX = event.srcEvent.x - offset.left - jQueryElement.width() / 2;
			// From clockwise angle to counterclockwise angle
			captureThis.updateRotation(Math.atan2(-deltaY, deltaX));
			captureThis.camera.rotate(prevTheta - captureThis.theta, window.innerWidth / 2, window.innerHeight / 2, true);
			draw();
		});
	}

	updateRotation(theta) {
		this.theta = theta;
		this.element.css({"transform": `rotate(${naturalTheta-this.theta}rad)`});
	}
}
