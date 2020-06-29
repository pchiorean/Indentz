/*
	Fit to spread bleedbox v1.6.0
	© June 2020, Paul Chiorean
	This script resizes the selection to the spread bleedbox.
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
	// Get target size
	var spread = page.parent;
	var szOg = obj.geometricBounds;
	var szOv = obj.visibleBounds;
	var szB = Bounds(spread);
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
	// Case 2: Text frames
	if (obj.constructor.name == "TextFrame") return;
	// Other cases: Containment
	var frame = spread.rectangles.add(clipFrameP); // Make clipping rectangle
	frame.sendToBack(obj);
	app.select(obj); app.cut();
	app.select(frame); app.pasteInto();
}

function Bounds(spread) { // Return spread bleed bounds
	var fPg = spread.pages.firstItem();
	var lPg = spread.pages.lastItem();
	var bleed = {
		top: doc.documentPreferences.properties.documentBleedTopOffset,
		left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
		bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
		right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
	}
	if (spread.pages.length == 1) { // Spread is single page
		var size = fPg.bounds;
		// Reverse left and right margins if left-hand page
		if (fPg.side == PageSideOptions.LEFT_HAND) {
			bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
			bleed.right = doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
		}
	} else { // Spread is multiple pages
		var size = [fPg.bounds[0], fPg.bounds[1], lPg.bounds[2], lPg.bounds[3]];
		// Reverse left and right margins if left-hand page
		if (fPg.side == PageSideOptions.LEFT_HAND) {
			bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
		}
	}
	return [
		size[0] - bleed.top,
		size[1] - bleed.left,
		size[2] + bleed.bottom,
		size[3] + bleed.right
	];
}