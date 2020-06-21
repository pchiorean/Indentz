/*
	Fit to spread margins v1.1.11
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
// Get selection's parent spread
var selObj = doc.selection, spread;
for (var i = 0; i < selObj.length; i++) {
	if (selObj[i].parentPage != null) { spread = selObj[i].parentPage.parent; break };
}
if (spread == null) { alert("Select an object on page and try again."); exit() };
// Save setting and set ruler origin to spread
var ro = doc.viewPreferences.rulerOrigin;
doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;
// Resize selected object(s)
var size = bounds(spread);
for (var i = 0; i < selObj.length; i++) {
	var obj = selObj[i];
	if (obj.constructor.name != "Rectangle") continue; // TODO
	obj.fit(FitOptions.FRAME_TO_CONTENT);
	obj.geometricBounds = [
		Math.max(obj.visibleBounds[0], size[0]),
		Math.max(obj.visibleBounds[1], size[1]),
		Math.min(obj.visibleBounds[2], size[2]),
		Math.min(obj.visibleBounds[3], size[3])
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