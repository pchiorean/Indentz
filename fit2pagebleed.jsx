/*
	Fit to page bleed v1.0.5
	© May 2020, Paul Chiorean
	This script resizes the selection to the page size, including bleed.
*/

var doc = app.activeDocument;
var selObj = doc.selection;
var selObj_y1, selObj_x1, selObj_y2, selObj_x2;
var selPg, sizePgB;

if (selObj.length > 0 && selObj[0].constructor.name != "Guide") {
	// Get selection's parent page
	for (i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { selPg = selObj[i].parentPage; break };
	}
	// Resize selected object(s)
	if (selPg != null) {
		sizePgB = bounds(selPg);
		for (i = 0; i < selObj.length; i++) {
			selObj[i].fit(FitOptions.FRAME_TO_CONTENT);
			selObj_y1 = Math.max(selObj[i].visibleBounds[0], sizePgB[0]);
			selObj_x1 = Math.max(selObj[i].visibleBounds[1], sizePgB[1]);
			selObj_y2 = Math.min(selObj[i].visibleBounds[2], sizePgB[2]);
			selObj_x2 = Math.min(selObj[i].visibleBounds[3], sizePgB[3]);
			selObj[i].geometricBounds = [selObj_y1, selObj_x1, selObj_y2, selObj_x2];
		}
	} else alert("Please select an object not on pasteboard and try again.");
} else alert("Please select an object and try again.");


function bounds(page) { // Return page bleed bounds
	var sizePg = page.bounds;
	var fPg = page.parent.pages.firstItem();
	var lPg = page.parent.pages.lastItem();
	var bleed, m_y1, m_x1, m_y2, m_x2;
	bleed = {
		top: doc.documentPreferences.properties.documentBleedTopOffset,
		left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
		bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
		right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
	}
	// Default is middle page
	m_x1 = sizePg[1];
	m_y1 = sizePg[0] - bleed.top;
	m_x2 = sizePg[3];
	m_y2 = sizePg[2] + bleed.bottom;
	if (page.parent.pages.length == 1) { // Spread is single page
		// Reverse left and right margins if left-hand page
		if (fPg.side == PageSideOptions.LEFT_HAND) {
			bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
			bleed.right = doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
		}
		m_x1 -= bleed.left;
		m_x2 += bleed.right;
	} else { // Spread is multiple pages
		switch (page) {
			case fPg:
				// Reverse left and right margins if left-hand page
				if (fPg.side == PageSideOptions.LEFT_HAND) {
					bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
				}
				m_x1 -= bleed.left; break;
			case lPg:
				m_x2 += bleed.right; break;
		}
	} return [m_y1, m_x1, m_y2, m_x2];
}