// Contains all top-level code for now
// We may want to move some of the logic to a separate file later on

import { Camera, addTransformListeners } from "./camera.mjs";
import { Equirectangular, SphereMercator } from "./cartography.mjs";
import { addSearchbarListeners } from "./searchbar.mjs";

const ctx = $("#canvas")[0].getContext("2d");
const camera = new Camera(ctx);

addTransformListeners(camera);
addSearchbarListeners(camera);

const mercator = new SphereMercator({
	b: {x: 2281, y: 1648, latitude: 37.3583333333, longitude: -120.441666667},
	c: {x: 4708, y: 1648, latitude: 37.3583333333, longitude: -120.408333333}
});
window.mercator = mercator;

function draw() {
	camera.refreshTransform();
	// TODO Move the logic for this call to camera for abstraction
	ctx.drawImage($("#background-map")[0], 0, 0);
	// Feel free to experiment by adding some canvas draw calls here
	ctx.fillStyle = "crimson";
	// Here, I use the mercator object to convert my latitude and longitude
	// into a format that ctx can understand
	ctx.fillRect(...mercator.f(37.358, -120.44), 500, 500);
}

function resize() {
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
}

$(window).on("resize", function (e) {
	resize();
	draw();
});

resize();
draw();

// Debugging help
window.draw = draw;
window.camera = camera;
window.compass = compass;

window.logClicks = true;

$(window).on("click", function (event) {
	if (logClicks) {
		let [x, y] = [event.offsetX, event.offsetY];
		let [worldX, worldY] = camera.screenToWorld(x, y);
		let [lat, lon] = mercator.r(worldX, worldY);
		console.log("lat, lon:", lat, lon);
	}
});
