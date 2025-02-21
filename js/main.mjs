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

$("#canvas").on({
	// Not supported on all browsers, add buttons as alternative
	wheel: function (event) {
		// TODO Change formula to feel smoother, probably exponential
		let scaleFactor = 1 + event.originalEvent.deltaY * -0.0004
		camera.scale(scaleFactor, event.offsetX, event.offsetY);
		draw();
	},
});

// Using Hammer.js for touch events and mouse panning
let mc = new Hammer.Manager($("#canvas")[0], {
	recognizers: [
		[Hammer.Rotate],
		[Hammer.Pinch, {}, ['rotate']],
		[Hammer.Pan, {threshold: 0}]
	]
});

// TODO Fix erratic behavior when releasing from 2 pointers to 1
// Hammer.js gives us the cumulative delta, so we need to differentiate
let prevPanX, prevPanY;
mc.on("panstart", function (event) {
    prevPanX = prevPanY = 0;
});
mc.on("pan", function (event) {
    camera.translate(event.deltaX - prevPanX, event.deltaY - prevPanY);
    draw();
    prevPanX = event.deltaX;
    prevPanY = event.deltaY;
});

let prevRotate;
mc.on("rotatestart", function (event) {
    prevRotate = event.rotation;
});
mc.on("rotate", function (event) {
    let phi = Math.PI * (event.rotation - prevRotate) / 180;
    camera.rotate(phi, event.center.x, event.center.y);
    draw();
    prevRotate = event.rotation;
});

let prevPinchScale;
//let initPinchCenter;
mc.on("pinchstart", function (event) {
	prevPinchScale = event.scale;
	//initPinchCenter = event.center;
	//console.log("pinchstart", event.distance, event);
	//console.log("pinchstart", event.distance. event.center, event.changedPointers(
});
mc.on("pinch", function (event) {
	//console.log(event.distance, event);
	/*
	if (event.distance <= limit) {
		return;
	}
	*/
	let relativeScale = event.scale / prevPinchScale;
	//console.log(relativeScale);
	//camera.scale(relativeScale, initPinchCenter.x, initPinchCenter.y);
	camera.scale(relativeScale, event.center.x, event.center.y);
	prevPinchScale = event.scale;
});

resize();
draw();

// Debugging help
window.draw = draw;
window.camera = camera;
