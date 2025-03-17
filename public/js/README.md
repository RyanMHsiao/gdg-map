# js

Where the modular js files used in the site live.

**main.mjs** is the file that is included by the HTML page.

**camera.mjs** has the Camera class, which handles the panning, zooming, and rotating of the view of the map.
- **cameramath.mjs** contains some of the math needed to make the Camera class work.
- **camerautils.mjs** contains some logic that interacts with the Camera class.
- **compass.mjs** has the Compass class, which needs to work closely with the Camera.

**cartography.mjs** contains the logic for working with map projections.

**searchbar.mjs** contains the logic for the searchbar.
