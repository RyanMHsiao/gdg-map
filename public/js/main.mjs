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
  b: { x: 2281, y: 1648, latitude: 37.3583333333, longitude: -120.441666667 },
  c: { x: 4708, y: 1648, latitude: 37.3583333333, longitude: -120.408333333 },
});
window.mercator = mercator;

// async function loadJSON(filePath) {
//   try {
//     const response = await fetch(filePath);
//     if (!response.ok) throw new Error(`Failed to load ${filePath}`);
//     return await response.json();
//   } catch (error) {
//     console.error("Error loading JSON file:", error);
//     return null;
//   }
// }
let globalPoints = null; // Holds JSON data after loading

async function loadJSON(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${filePath}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading JSON file:", error);
    return null;
  }
}

async function preloadPoints() {
  const jsonData = await loadJSON("points.json");
  if (!jsonData) return;

  // Store them in a global variable
  globalPoints = jsonData.points;
}

// async function drawPoints() {
//   const jsonData = await loadJSON("points.json"); // Adjust the file path as needed
//   if (!jsonData) return;

//   // Collect [x, y] for each point
//   const xyArray = jsonData.points.map((point) => {
//     const [x, y] = mercator.f(point.latitude, point.longitude);
//     return [x, y];
//   });

//   // Draw each point
//   xyArray.forEach(([x, y], index) => {
//     ctx.beginPath();
//     ctx.fillStyle = "red";
//     ctx.strokeStyle = "black";
//     ctx.ellipse(x, y, 100, 100, 0, 0, 2 * Math.PI);
//     ctx.fill();
//     ctx.stroke();
//   });

//   // After all points are drawn, staple the bounding box so all remain on view
//   let minX = Math.min(...xyArray.map((p) => p[0]));
//   let maxX = Math.max(...xyArray.map((p) => p[0]));
//   let minY = Math.min(...xyArray.map((p) => p[1]));
//   let maxY = Math.max(...xyArray.map((p) => p[1]));

//   // Adjust the camera so this bounding box remains visible.
//   // Feel free to tweak the padding (100, 100, 200, 200) as needed.
//   camera.staple(minX, minY, maxX, maxY, 100, 100, 200, 200);

//   // Your additional drawing:
//   ctx.fillStyle = "blue";
//   ctx.fillRect(100, 100, 100, 100);
//   ctx.strokeStyle = "black";
//   ctx.fillStyle = "white";
//   ctx.textAlign = "center";
// }

function drawPoints() {
  // If the points haven't loaded yet, do nothing
  if (!globalPoints) return;

  // Collect [x, y] for each point
  const xyArray = globalPoints.map((point) => {
    const [x, y] = mercator.f(point.latitude, point.longitude);
    return [x, y];
  });

  // Draw each point
  xyArray.forEach(([x, y], index) => {
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.strokeStyle = "black";
    // Large ellipse for visibility; adjust as needed
    ctx.ellipse(x, y, 100, 100, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  });

  // Optional: Adjust camera to fit *all* points
  // If this causes flicker when zooming in/out, remove or relocate it.
  let minX = Math.min(...xyArray.map((p) => p[0]));
  let maxX = Math.max(...xyArray.map((p) => p[0]));
  let minY = Math.min(...xyArray.map((p) => p[1]));
  let maxY = Math.max(...xyArray.map((p) => p[1]));

  camera.staple(minX, minY, maxX, maxY, 100, 100, 200, 200);

  // Extra drawing
  ctx.fillStyle = "blue";
  ctx.fillRect(100, 100, 100, 100);
  ctx.strokeStyle = "black";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
}

function draw() {
  // Refresh camera transform first
  camera.refreshTransform();

  // Draw background map
  ctx.drawImage($("#background-map")[0], 0, 0);

  // Now draw your points (already loaded in globalPoints)
  drawPoints();
}

// function draw() {
//   camera.refreshTransform();
//   // TODO Move the logic for this call to camera for abstraction
//   ctx.drawImage($("#background-map")[0], 0, 0);
//   // Feel free to experiment by adding some canvas draw calls here
//   ctx.fillStyle = "crimson";
//   // Here, I use the mercator object to convert my latitude and longitude
//   // into a format that ctx can understand
//   //   let [x1, y1] = mercator.f(37.358, -120.44);
//   //   let [x2, y2] = mercator.f(37.357, -120.45);
//   //   ctx.beginPath();
//   //   ctx.ellipse(x1, y1, 100, 100, Math.PI / 4, 0, 2 * Math.PI);
//   //   ctx.ellipse(x2, y2, 100, 100, Math.PI / 4, 0, 2 * Math.PI);
//   //   ctx.fill();
//   //   camera.staple(x1, y1, x2, y2, 100, 100, 200, 200);
//   //   ctx.fillStyle = "blue";
//   //   ctx.fillRect(100, 100, 100, 100);
//   //   ctx.strokeStyle = "black";
//   //   ctx.fillStyle = "white";
//   //   ctx.textAlign = "center";

//   //   {
//   //     let [x1, y1] = mercator.f(37.378, -120.44);
//   //     let [x2, y2] = mercator.f(37.377, -120.45);
//   //     ctx.beginPath();
//   //     ctx.ellipse(x1, y1, 100, 100, Math.PI / 4, 0, 2 * Math.PI);
//   //     ctx.ellipse(x2, y2, 100, 100, Math.PI / 4, 0, 2 * Math.PI);
//   //     ctx.fill();
//   //     camera.staple(x1, y1, x2, y2, 100, 100, 200, 200);
//   //     ctx.fillStyle = "blue";
//   //     ctx.fillRect(100, 100, 100, 100);
//   //     ctx.strokeStyle = "black";
//   //     ctx.fillStyle = "white";
//   //     ctx.textAlign = "center";
//   //   }
//   //   camera.writeText("Test text", x1, y1);

//   drawPoints();
// }

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
    console.log(
      "lat, lon:",
      lat,
      lon,
      "worldX, worldY:",
      worldX,
      worldY,
      "screenX, screenY:",
      x,
      y
    );
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  await preloadPoints();
  // Now globalPoints is loaded, and you can safely call draw() or start your render loop
  draw();
});
