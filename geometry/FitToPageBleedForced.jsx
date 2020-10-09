/*
	Fit to page bleed, forced v2.0.0
	© October 2020, Paul Chiorean
	Resizes the selected objects to the page bleed size.
*/

app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) exit();
for (var i = 0; i < sel.length; i++) {
	var obj = sel[i], page;
	if (page = obj.parentPage) Fit(obj);
}


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

function Bounds(page) { // Return page bounds
	return page.bounds;
}

function BlBounds(page) { // Return page bleed bounds
	var fPg = page.parent.pages.firstItem();
	var lPg = page.parent.pages.lastItem();
	var bleed = {
		top: doc.documentPreferences.properties.documentBleedTopOffset,
		left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
		bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
		right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
	}
	var size = [ // Default is middle page
		page.bounds[0] - bleed.top,
		page.bounds[1],
		page.bounds[2] + bleed.bottom,
		page.bounds[3]
	];
	if (page.parent.pages.length == 1) { // Spread is single page
		// Reverse left and right margins if left-hand page
		if (fPg.side == PageSideOptions.LEFT_HAND) {
			bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
			bleed.right = doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
		}
		size[1] -= bleed.left;
		size[3] += bleed.right;
	} else { // Spread is multiple pages
		switch (page) {
			case fPg:
				// Reverse left and right margins if left-hand page
				if (fPg.side == PageSideOptions.LEFT_HAND) {
					bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
				}
				size[1] -= bleed.left; break;
			case lPg:
				size[3] += bleed.right; break;
		}
	}
	return size;
}