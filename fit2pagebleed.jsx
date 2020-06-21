/*
	Fit to page bleed v1.0.9
	© June 2020, Paul Chiorean
	This script resizes the selection to the page size, including bleed.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Get selection's parent page
var selObj = sel, page;
for (var i = 0; i < selObj.length; i++) {
	if (selObj[i].parentPage != null) { page = selObj[i].parentPage; break };
}
if (page == null) { alert("Select an object on page and try again."); exit() };
// Resize selected object(s)
var size = bounds(page);
for (var i = 0; i < selObj.length; i++) {
	var obj = selObj[i];
	if (obj.parentPage != page) continue;
	if (obj.constructor.name != "Rectangle") continue; // TODO
	obj.fit(FitOptions.FRAME_TO_CONTENT);
	obj.geometricBounds = [
		Math.max(obj.visibleBounds[0], size[0]),
		Math.max(obj.visibleBounds[1], size[1]),
		Math.min(obj.visibleBounds[2], size[2]),
		Math.min(obj.visibleBounds[3], size[3])
	];
}


function bounds(page) { // Return page bleed bounds
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