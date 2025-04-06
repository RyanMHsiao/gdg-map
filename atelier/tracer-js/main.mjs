// Contains all top-level code for now
// We may want to move some of the logic to a separate file later on

import { Camera, addCameraListeners, mergeLeft } from "./camera.mjs";

const ctx = $("#canvas")[0].getContext("2d");
const camera = new Camera(ctx);

addCameraListeners(camera);

(function addSearchbarListeners(camera) {
	$("#searchbar-submit").on("click", function (event) {
		eval(prompt("Enter script here"));
	});
})()

function setImage(src) {
	$("#background-map").attr("src", "./assets/" + src);
	draw();
}

window.vertices = [];
window.labels = [];

let lastX = 0, lastY = 0;
$(window).on("mousemove", function (event) {
	lastX = event.offsetX;
	lastY = event.offsetY;
});

$(window).on("keydown", function (event) {
	if (event.key == "a") {
		let [x, y] = [lastX, lastY];
		let worldPos = camera.screenToWorld(x, y);
		vertices.push(worldPos);
		labels.push(prompt("What is the name of the point you added?"));
	} else if (event.key == "r") {
		vertices.pop();
		labels.pop();
	}
	draw();
});

const backgroundStyle = { fillStyle: "white" };
const pointStyle = { fillStyle: "crimson" };
function draw() {
	ctx.resetTransform();
	mergeLeft(ctx, backgroundStyle);
	ctx.fillRect(0, 0, document.body.offsetWidth, document.body.offsetHeight);
	camera.refreshTransform();
	// TODO Move the logic for this call to camera for abstraction
	ctx.drawImage($("#background-map")[0], 0, 0);
	// Feel free to experiment by adding some canvas draw calls here
	// Here, I use the mercator object to convert my latitude and longitude
	// into a format that ctx can understand
	mergeLeft(ctx, pointStyle);
	vertices.forEach(x => ctx.fillRect(x[0] - 2, x[1] - 2, 4, 4));
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
		console.log("worldX, worldY:", worldX, worldY, "screenX, screenY:", x, y);
	}
});
