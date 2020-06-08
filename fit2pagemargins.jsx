/*
	Fit to page margins v1.1.3
	© June 2020, Paul Chiorean
	This script resizes the selection to the page margins.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var selObj = doc.selection;
var selObj_y1, selObj_x1, selObj_y2, selObj_x2;
var selPg, sizeMg;

if (selObj.length > 0 && selObj[0].constructor.name != "Guide") {
	// Get selection's parent page
	for (i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { selPg = selObj[i].parentPage; break };
	}
	// Resize selected object(s)
	if (selPg != null) {
		sizeMg = bounds(selPg);
		for (i = 0; i < selObj.length; i++) {
			selObj[i].fit(FitOptions.FRAME_TO_CONTENT);
			selObj_y1 = Math.max(selObj[i].visibleBounds[0], sizeMg[0]);
			selObj_x1 = Math.max(selObj[i].visibleBounds[1], sizeMg[1]);
			selObj_y2 = Math.min(selObj[i].visibleBounds[2], sizeMg[2]);
			selObj_x2 = Math.min(selObj[i].visibleBounds[3], sizeMg[3]);
			selObj[i].geometricBounds = [selObj_y1, selObj_x1, selObj_y2, selObj_x2];
		}
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