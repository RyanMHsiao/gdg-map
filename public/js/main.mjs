// Contains all top-level code for now
// We may want to move some of the logic to a separate file later on

import { Camera, addTransformListeners } from "./camera.mjs";
import { Equirectangular, SphereMercator } from "./cartography.mjs";

addTransformListeners();

const mercator = new SphereMercator({
	b: {x: 2281, y: 1648, latitude: 37.3583333333, longitude: -120.441666667},
	c: {x: 4708, y: 1648, latitude: 37.3583333333, longitude: -120.408333333}
});
window.mercator = mercator;

const ctx = $("#canvas")[0].getContext("2d");
const camera = new Camera(ctx);

function draw() {
	// TODO Move the logic for this call to camera for abstraction
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
	draw();
}
$("#searchbar-data").on("keyup", function (event) {
	if (event.key == "Enter" || event.keyCode == 13) {
		focusOn(this.value);
	}
});
$("#searchbar-submit").on("click", function (event) {
	focusOn($("#searchbar-data")[0].value);
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
