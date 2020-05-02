/*
	Fit to spread v1.1.7
	© May 2020, Paul Chiorean
	This script resizes the selection to the spread size.
*/

var doc = app.activeDocument;
var selObj = doc.selection;

if (selObj.length > 0 && selObj[0].constructor.name != "Guide") {
	// Save setting and set ruler origin to spread
	var ro = doc.viewPreferences.rulerOrigin;
	doc.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;
	// Get selection's parent spread
	var selSp;
	for (i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { selSp = selObj[i].parentPage.parent; break };
	}
	if (selSp != null) {
		for (i = 0; i < selObj.length; i++) selObj[i].geometricBounds = bounds(selSp);
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