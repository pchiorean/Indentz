/*
	Fit to spread bleed, forced v2.0.1
	© October 2020, Paul Chiorean
	Resizes the selected objects to the spread bleed size.
*/

app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) exit();
var ro = doc.viewPreferences.rulerOrigin;
doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;
for (var i = 0; i < sel.length; i++) {
	var obj = sel[i], page;
	if (page = obj.parentPage) { page = page.parent; Fit(obj) }
}
doc.viewPreferences.rulerOrigin = ro;


function Fit(obj) {
	var pg = Bounds(page);
	var fit = BlBounds(page);
	var objRA = obj.absoluteRotationAngle;
	// Case 1: Labeled 'HW'
	if (obj.label == "HW") {
		obj.geometricBounds = [(pg[2] - pg[0]) * 0.9, fit[1], fit[2], fit[3]];
		if (obj.constructor.name == "TextFrame")
			obj.textFramePreferences.insetSpacing =
				[0, 0, doc.documentPreferences.properties.documentBleedBottomOffset, 0];
		return;
	}
	// Case 2a: Already clipped
	if (obj.name == "<clip frame>" && obj.pageItems[0].isValid) {
		obj.geometricBounds = fit; return;
	}
	// Case 2b: Already a container
	if (obj.constructor.name == "Rectangle" &&
		obj.pageItems.length == 1 &&
		obj.strokeWeight == 0 &&
		(objRA == 0 || Math.abs(objRA) == 90 || Math.abs(objRA) == 180)) {
			obj.geometricBounds = fit; return;
	}
	// Case 3: Simple rectangle
	if (obj.constructor.name == "Rectangle" &&
		obj.strokeWeight == 0 &&
		(objRA == 0 || Math.abs(objRA) == 90 || Math.abs(objRA) == 180)) {
			obj.geometricBounds = fit; return;
	}
	// Case 4: Text frame
	if (obj.constructor.name == "TextFrame" &&
		(objRA == 0 || Math.abs(objRA) == 90 || Math.abs(objRA) == 180)) {
			obj.geometricBounds = fit; return;
	}
	// Other cases: Clip
		var frame = doc.rectangles.add(
			obj.itemLayer, LocationOptions.AFTER, obj,
			{ name: "<clip frame>", label: obj.label,
			fillColor: "None", strokeColor: "None",
			geometricBounds: fit
		}
	);
	frame.sendToBack(obj); app.select(obj); app.cut(); app.select(frame); app.pasteInto();
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

function BlBounds(spread) { // Return spread bleed bounds
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