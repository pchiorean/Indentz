/*
	Fit to spread v1.6.1
	© July 2020, Paul Chiorean
	This script resizes the selected objects to the spread size, if they exceed it.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Save setting and set ruler origin to spread
var ro = doc.viewPreferences.rulerOrigin;
doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;
// Resize selected object(s)
for (var i = 0; i < sel.length; i++) {
	var obj = sel[i], page;
	if (page = obj.parentPage) Fit(obj);
}
// Restore ruler origin setting
doc.viewPreferences.rulerOrigin = ro;


function Fit(obj) {
	// Undo if already clipped
	if ((obj.label == "<clip group>" || obj.name == "<clip group>") &&
		obj.pageItems.length == 0 ) { obj.label = ""; obj.name = "" };
	if (obj.label == "<clip group>" && obj.pageItems[0].isValid) {
		var objD = obj.pageItems[0].duplicate();
		objD.sendToBack(obj); obj.remove(); app.select(objD);
		return;
	}
	// Get target size
	var spread = page.parent;
	var szOg = obj.geometricBounds;
	var szOv = obj.visibleBounds;
	var szB = Bounds(spread);
	var size = [
		szOg[2] > szB[0] ? Math.max(szOv[0], szB[0]) : szOg[0], // top
		szOg[3] > szB[1] ? Math.max(szOv[1], szB[1]) : szOg[1], // left
		szOg[0] < szB[2] ? Math.min(szOv[2], szB[2]) : szOg[2], // bottom
		szOg[1] < szB[3] ? Math.min(szOv[3], szB[3]) : szOg[3]  // right
	];
	if ( // Skip if obj size is smaller than target size
		Number(szOv[0].toFixed(11)) >= Number(size[0].toFixed(11)) &&
		Number(szOv[1].toFixed(11)) >= Number(size[1].toFixed(11)) &&
		Number(szOv[2].toFixed(11)) <= Number(size[2].toFixed(11)) &&
		Number(szOv[3].toFixed(11)) <= Number(size[3].toFixed(11)) &&
		// and is not HW
		(obj.name != "HW" && obj.label != "HW")
	) return;
	// Clipping rectangle properties
	var clipFrameP = {
		label: "<clip group>", name: "<clip group>",
		itemLayer: obj.itemLayer,
		fillColor: "None", strokeColor: "None",
		geometricBounds: size
	}
	// Case 1: Simple rectangles
	if (obj.constructor.name == "Rectangle" &&
		obj.strokeWeight <= 1 &&
		(obj.absoluteRotationAngle == 0 ||
		Math.abs(obj.absoluteRotationAngle) == 90 ||
		Math.abs(obj.absoluteRotationAngle) == 180)) {
		// HW is a special case
		if (obj.name == "HW" || obj.label == "HW") {
			obj.geometricBounds = [
				(szB[2] - szB[0]) * 0.9, szB[1], szB[2], szB[3]
			];
			return;
		} else { obj.geometricBounds = size; return };
	}
	// Case 2: Text frames
	if (obj.constructor.name == "TextFrame" &&
		(obj.absoluteRotationAngle == 0 ||
		Math.abs(obj.absoluteRotationAngle) == 90 ||
		Math.abs(obj.absoluteRotationAngle) == 180)) {
			obj.geometricBounds = size; return;
	}
	// Case 3: Orthogonal lines
	if (obj.constructor.name == "GraphicLine" && (szOg[0] == szOg[2]) || (szOg[1] == szOg[3])) {
		// Make temp rectangle and resolve TL-BR
		var frame = spread.rectangles.add(clipFrameP);
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
	// Other cases: Containment
	var frame = spread.rectangles.add(clipFrameP); // Make clipping rectangle
	frame.sendToBack(obj);
	app.select(obj); app.cut();
	app.select(frame); app.pasteInto();
}

function Bounds(spread) { // Return spread bounds
	var fPg = spread.pages.firstItem();
	var lPg = spread.pages.lastItem();
	if (spread.pages.length == 1) { // Spread is single page
		var size = fPg.bounds;
	} else { // Spread is multiple pages
		var size = [fPg.bounds[0], fPg.bounds[1], lPg.bounds[2], lPg.bounds[3]];
	}
	return size;
}