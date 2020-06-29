/*
	Fit to page margins v1.4.0
	© June 2020, Paul Chiorean
	This script resizes the selection to the page margins.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Resize selected object(s)
for (var i = 0; i < sel.length; i++) {
	var obj = sel[i], page;
	if (page = obj.parentPage) Fit(obj);
}


function Fit(obj) {
	// Get target size
	var szOg = obj.geometricBounds;
	var szOv = obj.visibleBounds;
	var szB = Bounds(page);
	var size = [
		szOg[2] > szB[0] ? Math.max(szOv[0], szB[0]) : szOg[0], // top
		szOg[3] > szB[1] ? Math.max(szOv[1], szB[1]) : szOg[1], // left
		szOg[0] < szB[2] ? Math.min(szOv[2], szB[2]) : szOg[2], // bottom
		szOg[1] < szB[3] ? Math.min(szOv[3], szB[3]) : szOg[3] // right
	];
	if ( // Skip if obj size is smaller than target size
		Number(szOv[0].toFixed(11)) >= Number(size[0].toFixed(11)) &&
		Number(szOv[1].toFixed(11)) >= Number(size[1].toFixed(11)) &&
		Number(szOv[2].toFixed(11)) <= Number(size[2].toFixed(11)) &&
		Number(szOv[3].toFixed(11)) <= Number(size[3].toFixed(11))
	) return;
	// Clipping rectangle properties
	var clipFrameP = {
		label: "<clip group>", name: "<clip group>",
		fillColor: "None", strokeColor: "None",
		geometricBounds: size
	}
	// Case 1: Simple rectangles
	if (obj.constructor.name == "Rectangle" &&
		obj.strokeWeight == 0 &&
		(obj.absoluteRotationAngle == 0 ||
		Math.abs(obj.absoluteRotationAngle) == 90 ||
		Math.abs(obj.absoluteRotationAngle) == 180)) {
			obj.geometricBounds = size; return;
	}
	// Case 2: Orthogonal lines
	if (obj.constructor.name == "GraphicLine" && (szOg[0] == szOg[2]) || (szOg[1] == szOg[3])) {
		// Make temp rectangle and resolve TL-BR
		var frame = page.rectangles.add(clipFrameP);
		var frame_TL = frame.resolve(AnchorPoint.TOP_LEFT_ANCHOR, 
			CoordinateSpaces.SPREAD_COORDINATES)[0];
		var frame_BR = frame.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, 
			CoordinateSpaces.SPREAD_COORDINATES)[0];
		frame.remove(); // Remove temp rectangle
		if ( // Skip if obj size is smaller than target size
			Number(size[0].toFixed(11)) <= Number(frame_TL[1].toFixed(11)) &&
			Number(size[1].toFixed(11)) <= Number(frame_TL[0].toFixed(11)) &&
			Number(size[2].toFixed(11)) >= Number(frame_BR[3].toFixed(11)) &&
			Number(size[3].toFixed(11)) >= Number(frame_BR[2].toFixed(11))
		) return;
		if (obj.endCap != 1919115632) { // If endcap is round, skip
			obj.reframe(CoordinateSpaces.SPREAD_COORDINATES, [frame_TL, frame_BR]);
			return;
		}
	}
	// Case 2: Text frames
	if (obj.constructor.name == "TextFrame") return;
	// Other cases: Containment
	var frame = page.rectangles.add(clipFrameP); // Make clipping rectangle
	frame.sendToBack(obj);
	app.select(obj); app.cut();
	app.select(frame); app.pasteInto();
}

function Bounds(page) { // Return page margins bounds
	var size = [
		page.bounds[0] + page.marginPreferences.top,
		page.bounds[1] + page.marginPreferences.left,
		page.bounds[2] - page.marginPreferences.bottom,
		page.bounds[3] - page.marginPreferences.right
	]
	// Reverse left and right margins if left-hand page
	if (page.side == PageSideOptions.LEFT_HAND) {
		size[1] = page.bounds[1] + page.marginPreferences.right;
		size[3] = page.bounds[3] - page.marginPreferences.left;
	}
	return size;
}