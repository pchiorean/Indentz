/*
	Fit to page bleed, forced v1.11.0
	© October 2020, Paul Chiorean
	Resizes the selected objects to the page bleed size.
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
	// Undo if already clipped
	// if (obj.name == "<clip frame>" && obj.pageItems[0].isValid) {
	// 	var objD = obj.pageItems[0].duplicate();
	// 	objD.label = obj.label;
	// 	objD.sendToBack(obj); obj.remove(); app.select(objD);
	// 	return;
	// }
	// Get target size
	var size = Bounds(page);
	// Clipping rectangle properties
	var clipFrameP = {
		name: "<clip frame>",
		itemLayer: obj.itemLayer,
		fillColor: "None", strokeColor: "None",
		geometricBounds: size
	}
	// Case 1: Objects labeled "HW"
	if (obj.label == "HW") {
		obj.geometricBounds = [
			(page.bounds[2] - page.bounds[0]) * 0.9, size[1], size[2], size[3]
		];
		if (obj.constructor.name == "TextFrame") {
			obj.textFramePreferences.insetSpacing = [
				0, 0, doc.documentPreferences.properties.documentBleedBottomOffset, 0
			]}
		return;
	}
	// Case 2a: If already clipped, just resize
	if (obj.name == "<clip frame>" && obj.pageItems[0].isValid) {
		obj.geometricBounds = size; return;
	}
	// Case 2b: Simple rectangles
	if (obj.constructor.name == "Rectangle" &&
		obj.strokeWeight == 0 &&
		(obj.absoluteRotationAngle == 0 ||
		Math.abs(obj.absoluteRotationAngle) == 90 ||
		Math.abs(obj.absoluteRotationAngle) == 180)) {
			obj.geometricBounds = size; return;
	}
	// Case 3: Groups
	if (obj.constructor.name == "Group") {
		var frame = page.rectangles.add(clipFrameP); // Make clipping rectangle
		frame.sendToBack(obj);
		frame.label = obj.label;
		app.select(obj); app.cut(); app.select(frame); app.pasteInto();
	}
}


function Bounds(page) { // Return page bleed bounds
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