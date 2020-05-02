/*
	Fit to spread margins v1.1.7
	© May 2020, Paul Chiorean
	This script resizes the selection to the page margins.
	If page is part of a spread, resize to the spread margins.
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


function bounds(spread) { // Return spread margins bounds
	var fPg = spread.pages.firstItem();
	var lPg = spread.pages.lastItem();
	var sizeSp, mgSp, m_y1, m_x1, m_y2, m_x2;
	sizeSp = fPg.bounds;
	mgSp = {
		top: fPg.marginPreferences.top,
		left: fPg.marginPreferences.left,
		bottom: fPg.marginPreferences.bottom,
		right: fPg.marginPreferences.right
	}
	if (spread.pages.length == 1) { // Spread is single page
		// Reverse left and right margins if left-hand page
		if (fPg.side == PageSideOptions.LEFT_HAND) {
			mgSp.left = fPg.marginPreferences.right;
			mgSp.right =  fPg.marginPreferences.left;
		}
	} else { // Spread is multiple pages
		sizeSp = [fPg.bounds[0], fPg.bounds[1], lPg.bounds[2], lPg.bounds[3]];
		// Reverse left and right margins if left-hand page
		if (fPg.side == PageSideOptions.LEFT_HAND) {
			mgSp.left = fPg.marginPreferences.right;
		}
		mgSp.bottom = lPg.marginPreferences.bottom;
		mgSp.right = lPg.marginPreferences.right;
	}
	if (mgSp.top + mgSp.left + mgSp.bottom + mgSp.right != 0) {
		m_y1 = mgSp.top;
		m_x1 = mgSp.left;
		m_y2 = sizeSp[2] - mgSp.bottom;
		m_x2 = sizeSp[3] - mgSp.right;
		return [m_y1, m_x1, m_y2, m_x2];
	} else return sizeSp;
}