// Adds camera listeners using Hammerjs 
// Uses closures instead of an object oriented style to store state
// Written by Ryan Hsiao

// TODO Add animation capabilities
function addCameraListeners(camera) {
	// Adding a scroll wheel based zoom
	// Not supported on all browsers, add buttons as alternative
	$("#canvas").on("wheel", function (event) {
		// TODO Change formula to feel smoother, probably exponential
		let scaleFactor = 1 + event.originalEvent.deltaY * -0.0004
		camera.scale(scaleFactor, event.offsetX, event.offsetY);
		draw();
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
		//console.log("pinchend");
	});
}

export { addCameraListeners };
