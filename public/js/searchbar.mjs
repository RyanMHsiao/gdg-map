// Listener for searchbar

// These are in pixel values for now
// TODO Replace with actual data mapped through a SphereMercator transformation
let tempFeatures = {
	"Administration Building": { x: 1490, y: 2230 },
}

function focusOn(camera, feature) {
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

function addSearchbarListeners(camera) {
	$("#searchbar-data").on("keyup", function (event) {
		if (event.key == "Enter" || event.keyCode == 13) {
			focusOn(camera, this.value);
		}
	});
	$("#searchbar-submit").on("click", function (event) {
		focusOn(camera, $("#searchbar-data")[0].value);
	});
}

export { addSearchbarListeners };
