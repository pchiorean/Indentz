/*
	Fit to spread margins v1.1.6
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
	var selSpread;
	for (i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { selSpread = selObj[i].parentPage.parent; break };
	}
	if (selSpread != null) {
		for (i = 0; i < selObj.length; i++) selObj[i].geometricBounds = spreadSafeArea(selSpread);
		// Restore ruler origin setting
		doc.viewPreferences.rulerOrigin = ro;
	} else alert("Please select an object not on pasteboard and try again.");
} else alert("Please select an object and try again.");
// END


// Function to calculate safe area coordinates from spread margins
function spreadSafeArea(spread) {
	var firstPage = spread.pages.firstItem(); // First page of spread
	var lastPage = spread.pages.lastItem(); // Last page of spread
	var spreadSize, spreadMargins, m_y1, m_x1, m_y2, m_x2;
	spreadSize = firstPage.bounds;
	spreadMargins = {
		top: firstPage.marginPreferences.top,
		left: firstPage.marginPreferences.left,
		bottom: firstPage.marginPreferences.bottom,
		right: firstPage.marginPreferences.right
	}
	if (spread.pages.length == 1) { // Spread is single page
		// Reverse left and right margins if left-hand page
		if (firstPage.side == PageSideOptions.LEFT_HAND) {
			spreadMargins.left = firstPage.marginPreferences.right;
			spreadMargins.right =  firstPage.marginPreferences.left;
		}
	} else { // Spread is multiple pages
		spreadSize = [firstPage.bounds[0], firstPage.bounds[1], lastPage.bounds[2], lastPage.bounds[3]];
		// Reverse left and right margins if left-hand page
		if (firstPage.side == PageSideOptions.LEFT_HAND) {
			spreadMargins.left = firstPage.marginPreferences.right;
		}
		spreadMargins.bottom = lastPage.marginPreferences.bottom;
		spreadMargins.right = lastPage.marginPreferences.right;
	}
	if (spreadMargins.top + spreadMargins.left + spreadMargins.bottom + spreadMargins.right != 0) {
		m_y1 = spreadMargins.top;
		m_x1 = spreadMargins.left;
		m_y2 = spreadSize[2] - spreadMargins.bottom;
		m_x2 = spreadSize[3] - spreadMargins.right;
		return [m_y1, m_x1, m_y2, m_x2];
	} else return spreadSize;
}