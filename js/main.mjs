// Contains all top-level code for now
// We may want to move some of the logic to a separate file later on

import { Camera } from "./camera.mjs";

const ctx = $("#canvas")[0].getContext("2d");
const camera = new Camera(ctx);

function draw() {
	ctx.drawImage($("#background-map")[0], 0, 0);
}

function resize() {
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
}

$(window).on("resize", function (e) {
	resize();
	draw();
});

// Using jQuery to handle mouse-based events
$("#canvas").on({
	// This logic handled by Hammer.js
	/*
	mousemove: function (event) {
		if (event.buttons > 0) {
			// Below line could be used to check for middle mouse button
			// if (event.button == 1) {
			// Middle mouse button usage fired the wheel event instead in my testing
			camera.translate(event.originalEvent.movementX, event.originalEvent.movementY);
			draw();
		}
	},*/
	// Not supported on all browsers, add buttons as alternative
	wheel: function (event) {
		camera.scale(event.originalEvent.deltaY, event.offsetX, event.offsetY);
		draw();
	},
	/*
	// Debugging help
	click: function (event) {
		console.log(event);
		console.log(camera.screenToWorld(event.offsetX, event.offsetY));
	}
	*/
});

// Using Hammer.js for touch events and mouse panning
let mc = new Hammer.Manager($("#canvas")[0], {
	recognizers: [
		// Rotation not ready yet
		// [Hammer.Rotate],
		[Hammer.Pinch],
		[Hammer.Pan, {threshold: 0}]
	]
});

// Hammer.js gives us the cumulative delta, so we need to differentiate
let prevPan = [0, 0];
mc.on("pan", function (event) {
	camera.translate(event.deltaX - prevPan[0], event.deltaY - prevPan[1]);
	draw();
	if (event.isFinal) {
		// Reset for the next pan event
		prevPan[0] = prevPan[1] = 0;
	} else {
		prevPan[0] = event.deltaX;
		prevPan[1] = event.deltaY;
	}
});

// Not yet implemented because of unanswered design questions
// Mainly, what the fixed point should be
// Options are pinch center, screen center, and user location
// There are also problems with preventing a pinch event from turning into a pan
// since a user can easily fat-finger that with the current lack of pan threshold
mc.on("pinch", function (event) {
	console.log(event.deltaX, event.deltaY, event.center, event.distance, event.isFinal);
});

resize();
draw();

// Debugging help
window.draw = draw;
window.camera = camera;
