/*
	Fit to page margins v1.1.1
	© May 2020, Paul Chiorean
	This script resizes the selection to the page margins.
*/

var doc = app.activeDocument;
var selObj = doc.selection;

if (selObj.length > 0 && selObj[0].constructor.name != "Guide") {
	// Get selection's parent page
	var selPg;
	for (i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { selPg = selObj[i].parentPage; break };
	}
	if (selPg != null) {
		for (i = 0; i < selObj.length; i++) selObj[i].geometricBounds = bounds(selPg);
	} else alert("Please select an object not on pasteboard and try again.");
} else alert("Please select an object and try again.");


function bounds(page) { // Return page margins bounds
	var sizePg = page.bounds;
	var mgPg = page.marginPreferences;
	var m_y1, m_x1, m_y2, m_x2;
	if (mgPg.top + mgPg.left + mgPg.bottom + mgPg.right != 0) {
		m_y1 = page.bounds[0] + mgPg.top;
		m_x1 = page.bounds[1] + mgPg.left;
		m_y2 = page.bounds[2] - mgPg.bottom;
		m_x2 = page.bounds[3] - mgPg.right;
		// Reverse left and right margins if left-hand page
		if (page.side == PageSideOptions.LEFT_HAND) {
			m_x1 = page.bounds[1] + mgPg.right;
			m_x2 = page.bounds[3] - mgPg.left;
		}
		return [m_y1, m_x1, m_y2, m_x2];
	} else return sizePg;
}