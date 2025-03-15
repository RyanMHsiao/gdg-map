// Contains all top-level code for now
// We may want to move some of the logic to a separate file later on

import { Camera, addCameraListeners } from "./camera.mjs";
import { Equirectangular, SphereMercator } from "./cartography.mjs";
import { addSearchbarListeners } from "./searchbar.mjs";

const ctx = $("#canvas")[0].getContext("2d");
const camera = new Camera(ctx);

addCameraListeners(camera);
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
	let [x1, y1] = mercator.f(37.358, -120.44);
	let [x2, y2] = mercator.f(37.357, -120.45);
	ctx.beginPath();
	ctx.ellipse(x1, y1, 100, 100, Math.PI / 4, 0, 2 * Math.PI);
	ctx.ellipse(x2, y2, 100, 100, Math.PI / 4, 0, 2 * Math.PI);
	ctx.fill();
	camera.staple(x1, y1, x2, y2, 100, 100, 200, 200);
	ctx.fillStyle = "blue";
	ctx.fillRect(100, 100, 100, 100);
	ctx.strokeStyle = "black";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	camera.writeText("Test text", x1, y1);
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
		console.log("lat, lon:", lat, lon, "worldX, worldY:", worldX, worldY, "screenX, screenY:", x, y);
	}
});
