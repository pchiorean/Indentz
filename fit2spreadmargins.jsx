/*
	Fit to spread margins v1.1.9
	© June 2020, Paul Chiorean
	This script resizes the selection to the page margins.
	If page is part of a spread, resize to the spread margins.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var selObj = doc.selection;
var selObj_y1, selObj_x1, selObj_y2, selObj_x2;
var selSp, sizeMg;

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
		sizeMg = bounds(selSp);
		for (i = 0; i < selObj.length; i++) {
			selObj[i].fit(FitOptions.FRAME_TO_CONTENT);
			selObj_y1 = Math.max(selObj[i].visibleBounds[0], sizeMg[0]);
			selObj_x1 = Math.max(selObj[i].visibleBounds[1], sizeMg[1]);
			selObj_y2 = Math.min(selObj[i].visibleBounds[2], sizeMg[2]);
			selObj_x2 = Math.min(selObj[i].visibleBounds[3], sizeMg[3]);
			selObj[i].geometricBounds = [selObj_y1, selObj_x1, selObj_y2, selObj_x2];
		}
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