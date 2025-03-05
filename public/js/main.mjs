// Contains all top-level code for now
// We may want to move some of the logic to a separate file later on

import { Camera } from "./camera.mjs";
import { Equirectangular, SphereMercator } from "./cartography.mjs";

const mercator = new SphereMercator({
	b: {x: 2281, y: 1648, latitude: 37.3583333333, longitude: -120.441666667},
	c: {x: 4708, y: 1648, latitude: 37.3583333333, longitude: -120.408333333}
});
window.mercator = mercator;

$(window).on("click", function (event) {
	let [x, y] = [event.offsetX, event.offsetY];
	let [worldX, worldY] = camera.screenToWorld(x, y);
	let [lat, lon] = mercator.r(worldX, worldY);
	let [reverseX, reverseY] = mercator.f(lat, lon);
	// console.log("x, y:", x, y);
	// console.log("worldX, worldY:", worldX, worldY);
	console.log("lat, lon:", lat, lon);
	// console.log("reverseX, reverseY:", reverseX, reverseY);
});

/*
const equirect = new Equirectangular({
	a: {x: 2281, y: 121, latitude: 37.375, longitude: -120.441666667},
	b: {x: 2281, y: 1648, latitude: 37.3583333333, longitude: -120.441666667},
	c: {x: 4708, y: 1648, latitude: 37.3583333333, longitude: -120.408333333}
});
window.equirect = equirect;
*/

const ctx = $("#canvas")[0].getContext("2d");
const camera = new Camera(ctx);

function draw() {
	ctx.drawImage($("#background-map")[0], 0, 0);
	// Feel free to experiment by adding some canvas draw calls here
	// You can test out the mercator or equirect object to make some conversions
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

// Listener for searchbar
let tempFeatures = {
	"pointa": { x: 3635, y: 919 },
	"pointb": { x: 3365, y: 1288 }
}
function focusOn(feature) {
	if (tempFeatures[feature] == undefined) {
		alert(`The feature ${feature} doesn't exist`);
		return;
	}
	if (isNaN(tempFeatures[feature].x + tempFeatures[feature].y)) {
		console.log(`Got NaN when looking for tempFeatures[${feature}] ${tempFeatures[feature]}`);
		return;
	}
	camera.setCenterOn(tempFeatures[feature].x, tempFeatures[feature].y);
}
$("#searchbar").on("keyup", function (event) {
	if (event.key == "Enter" || event.keyCode == 13) {
		focusOn(this.value);
		draw();
	}
});

resize();
draw();

// Debugging help
window.draw = draw;
window.camera = camera;
window.compass = compass;
