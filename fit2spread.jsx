/*
	Fit to spread v1.1.9
	© June 2020, Paul Chiorean
	This script resizes the selection to the spread size.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var selObj = doc.selection;
var selObj_y1, selObj_x1, selObj_y2, selObj_x2;
var selSp, sizeSp;

if (selObj.length > 0 && selObj[0].constructor.name != "Guide") {
	// Save setting and set ruler origin to spread
	var ro = doc.viewPreferences.rulerOrigin;
	doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;
	// Get selection's parent spread
	for (i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { selSp = selObj[i].parentPage.parent; break };
	}
	// Resize selected object(s)
	if (selSp != null) {
		sizeSp = bounds(selSp);
		for (i = 0; i < selObj.length; i++) {
			selObj[i].fit(FitOptions.FRAME_TO_CONTENT);
			selObj_y1 = Math.max(selObj[i].visibleBounds[0], sizeSp[0]);
			selObj_x1 = Math.max(selObj[i].visibleBounds[1], sizeSp[1]);
			selObj_y2 = Math.min(selObj[i].visibleBounds[2], sizeSp[2]);
			selObj_x2 = Math.min(selObj[i].visibleBounds[3], sizeSp[3]);
			selObj[i].geometricBounds = [selObj_y1, selObj_x1, selObj_y2, selObj_x2];
		}
		doc.viewPreferences.rulerOrigin = ro; // Restore ruler origin setting
	} else alert("Please select an object not on pasteboard and try again.");
} else alert("Please select an object and try again.");


function bounds(spread) { // Return spread bounds
	var fPg = spread.pages.firstItem();
	var lPg = spread.pages.lastItem();
	var sizeSp;
	if (spread.pages.length == 1) { // Spread is single page
		sizeSp = fPg.bounds;
	} else { // Spread is multiple pages
		sizeSp = [fPg.bounds[0], fPg.bounds[1], lPg.bounds[2], lPg.bounds[3]];
	}
	return sizeSp;
}