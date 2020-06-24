/*
	Fit to spread margins v1.2.0
	© June 2020, Paul Chiorean
	This script resizes the selection to the page margins.
	If page is part of a spread, resize to the spread margins.
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
	if (sel[i].constructor.name != "Rectangle") continue;
	if (sel[i].parentPage == null) continue;
	var szA = sel[i].visibleBounds;
	var szB = bounds(sel[i].parentPage.parent);
	sel[i].geometricBounds = [
		szA[2] > szB[0] ? Math.max(szA[0], szB[0]) : szA[0],
		szA[3] > szB[1] ? Math.max(szA[1], szB[1]) : szA[1],
		szA[0] < szB[2] ? Math.min(szA[2], szB[2]) : szA[2],
		szA[1] < szB[3] ? Math.min(szA[3], szB[3]) : szA[3]
	];
}
// Restore ruler origin setting
doc.viewPreferences.rulerOrigin = ro;


function bounds(spread) { // Return spread margins bounds
	var fPg = spread.pages.firstItem();
	var lPg = spread.pages.lastItem();
	var mgs = {
		top: fPg.marginPreferences.top,
		left: fPg.marginPreferences.left,
		bottom: fPg.marginPreferences.bottom,
		right: fPg.marginPreferences.right
	}
	if (spread.pages.length == 1) { // Spread is single page
	var size = fPg.bounds;
	// Reverse left and right margins if left-hand page
		if (fPg.side == PageSideOptions.LEFT_HAND) {
			mgs.left = fPg.marginPreferences.right;
			mgs.right = fPg.marginPreferences.left;
		}
	} else { // Spread is multiple pages
		var size = [fPg.bounds[0], fPg.bounds[1], lPg.bounds[2], lPg.bounds[3]];
		// Reverse left and right margins if left-hand page
		if (fPg.side == PageSideOptions.LEFT_HAND) {
			mgs.left = fPg.marginPreferences.right;
		}
		mgs.bottom = lPg.marginPreferences.bottom;
		mgs.right = lPg.marginPreferences.right;
	}
	return [
		size[0] + mgs.top,
		size[1] + mgs.left,
		size[2] - mgs.bottom,
		size[3] - mgs.right,
	];
}