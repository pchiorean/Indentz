/*
	Fit to page bleed v1.2.0
	© June 2020, Paul Chiorean
	This script resizes the selection to the page size, including bleed.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Resize selected object(s)
for (var i = 0; i < sel.length; i++) {
	if (sel[i].constructor.name != "Rectangle") continue;
	if (sel[i].parentPage == null) continue;
	var szA = sel[i].visibleBounds;
	var szB = bounds(sel[i].parentPage);
	sel[i].geometricBounds = [
		szA[2] > szB[0] ? Math.max(szA[0], szB[0]) : szA[0],
		szA[3] > szB[1] ? Math.max(szA[1], szB[1]) : szA[1],
		szA[0] < szB[2] ? Math.min(szA[2], szB[2]) : szA[2],
		szA[1] < szB[3] ? Math.min(szA[3], szB[3]) : szA[3]
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