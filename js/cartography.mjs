// Written by Ryan Hsiao // Most don't need to understand details, just how to use it
// Ask for help if any documentation is unclear

// Clases here follow this interface:
// constructor(data) takes in an object data to set up conversions
// Required contents of data may depend on projection
// f(lat, lon) provides the forward transformation to pixel values [x, y]
// r(x, y) provides the reverse transformation to latitude and longitude

// Based on https://en.wikipedia.org/wiki/Equirectangular_projection
export class Equirectangular {
	// What the x and y for Null Island would be
	originX;
	originY;
	// Ratio is cos phi_1 from the article, should be just under 0.8 for Merced
	// Unit is pixels per degree
	latScale;
	lonScale;
	// Angle of equator in clockwise radians from +x direction
	// Everything is clockwise because that's how canvas works
	equatorTheta;

	// To save myself from some tricky math, this requires 3 reference points
	// They must be arranged in an L shape with points A, B, and C
	// A and B must have the same longitude, and B and C must have the same latitude
	// Each point needs .x, .y, .longitude, .latitude
	// data must have .a, .b, .c
	// A
	// |
	// B-C
	// C can also be West of B, and A can be South of B.
	constructor(data) {
		// Checks are not comprehensive, but this should clear up the most common problem
		// Not accounting for crossing the prime meridian
		if (data.a.longitude != data.b.longitude) {
			console.log(`.a and .b from data do not have same longitude in ${data}`);
		} else if (data.b.latitude != data.c.latitude) {
			console.log(`.b and .c from data do not have same latitude in ${data}`);
		}
		let eastPoint = data.c, westPoint = data.b;
		if (data.c.longitude < data.b.longitude) {
			eastPoint = data.b;
			westPoint = data.c;
		}
		let northPoint = data.a, southPoint = data.b;
		if (data.a.latitude < data.b.latitude) {
			northPoint = data.b;
			southPoint = data.a;
		}
		this.equatorTheta = Math.atan2(eastPoint.y - westPoint.y, eastPoint.x - westPoint.x);
		// Calculating latScale
		let deltaX = data.a.x - data.b.x;
		let deltaY = data.a.y - data.b.y;
		let distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
		console.log("lat distance:", distance);
		this.latScale = distance / (northPoint.latitude - southPoint.latitude);
		// Calculating lonScale
		deltaX = data.b.x - data.c.x;
		deltaY = data.b.y - data.c.y;
		distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
		console.log("lon distance:", distance);
		this.lonScale = distance / (eastPoint.longitude - westPoint.longitude);
		// Extrapolate from our 3 points
		this.sine = Math.sin(this.equatorTheta);
		this.cosine = Math.cos(this.equatorTheta);
		this.originX = data.b.x - this.cosine * data.b.longitude * this.lonScale - this.sine * data.b.latitude * this.latScale;
		// We add here for clockwise reasons
		this.originY = data.b.y - this.cosine * data.b.latitude * this.latScale - this.sine * data.b.longitude * this.lonScale;
	}

	// Forward transformation
	f(latitude, longitude) {
		let deltaX = longitude * this.lonScale;
		let deltaY = latitude * this.latScale;
		[deltaX, deltaY] = [
			deltaX * Math.cos(this.equatorTheta) + deltaY * Math.sin(this.equatorTheta),
			deltaX * Math.sin(this.equatorTheta) + deltaY * Math.cos(this.equatorTheta)
		];
		return [this.originX + deltaX, this.originY + deltaY];
	}

	// Reverse transformation
	r(x, y) {
		// TODO Implement this
	}
}
