/*
	Fit to spread bleedbox, forced v1.6.1
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
	var size = Bounds(spread);
	// Clipping rectangle properties
	var clipFrameP = {
		label: "<clip group>", name: "<clip group>",
		itemLayer: obj.itemLayer,
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
	// Case 2: Groups
	if (obj.constructor.name == "Group") {
		var frame = spread.rectangles.add(clipFrameP); // Make clipping rectangle
		frame.sendToBack(obj);
		app.select(obj); app.cut();
		app.select(frame); app.pasteInto();
	}
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