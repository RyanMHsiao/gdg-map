// Contains all top-level code for now // We may want to move some of the logic to a separate file later on

import { Camera } from "./camera.mjs";
import { Equirectangular, SphereMercator } from "./cartography.mjs";

const mercator = new SphereMercator({
	b: {x: 1120, y: 944, latitude: 15, longitude: 15},
	c: {x: 1206, y: 944, latitude: 15, longitude: 30}
});
window.mercator = mercator;

const mercator2 = new SphereMercator({
	b: {x: 93, y: 367, latitude: 75, longitude: -165},
	c: {x: 435, y: 367, latitude: 75, longitude: -105}
});
window.mercator2 = mercator2;

$(window).on("click", function (event) {
	let [x, y] = [event.offsetX, event.offsetY];
	let [screenX, screenY] = camera.screenToWorld(x, y);
	let [lat, lon] = mercator.r(screenX, screenY);
	let [reverseX, reverseY] = mercator.f(lat, lon);
	console.log("x, y:", x, y);
	console.log("screenX, screenY:", screenX, screenY);
	console.log("lat, lon:", lat, lon);
	console.log("reverseX, reverseY:", reverseX, reverseY);
});

// Converter object between pixel coordinates and latitude, longitude
// Not very precise, tuned to the edge of the basketball court
const equirect = new Equirectangular({
	a: {x: 1527, y: 2050, latitude: 37.362473, longitude: -120.424833},
	b: {x: 1585, y: 2050, latitude: 37.362130, longitude: -120.424833},
	c: {x: 1585, y: 1964, latitude: 37.362130, longitude: -120.424193},
});
window.equirect = equirect;

const ctx = $("#canvas")[0].getContext("2d");
const camera = new Camera(ctx);

function draw() {
	ctx.drawImage($("#background-map")[0], 0, 0);
	// Feel free to experiment by adding some canvas draw calls here
	// You can test out the equirect object to make some conversions
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
// This has been mitigated, but this can still happen if you try this:
// One finger starts panning upwards
// Simultaneously stop that finger in place and add another finger moving upwards
// Release both fingers at once
// This causes a jump in the panning.
// Hammer.js gives us the cumulative delta, so we need to differentiate
let prevPanX, prevPanY;
mc.on("panstart", function (event) {
	//console.log("panstart");
    prevPanX = event.deltaX;
	prevPanY = event.deltaY;
});
mc.on("pan", function (event) {
	if (prevPanX !== null) {
		//console.log("pan");
		camera.translate(event.deltaX - prevPanX, event.deltaY - prevPanY);
		draw();
		prevPanX = event.deltaX;
		prevPanY = event.deltaY;
	} else {
		//console.log("failed pan");
	}
});
mc.on("panend", function (event) {
	//console.log("panend");
	prevPanX = prevPanY = null;
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
mc.on("pinchstart", function (event) {
	//console.log("pinchstart");
	prevPinchScale = event.scale;
});
mc.on("pinch", function (event) {
	//console.log("pinch");
	let relativeScale = event.scale / prevPinchScale;
	camera.scale(relativeScale, event.center.x, event.center.y);
	prevPinchScale = event.scale;
});
mc.on("pinchend", function (event) {
	//console.log("panend");
});

resize();
draw();

// Debugging help
window.draw = draw;
window.camera = camera;
window.compass = compass;
