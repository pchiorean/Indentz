/*
	Fit to page bleed v1.0.3
	© May 2020, Paul Chiorean
	This script resizes the selection to the page size, including bleed.
*/

var doc = app.activeDocument;
var selObj = doc.selection;

if (selObj.length > 0 && selObj[0].constructor.name != "Guide") {
	// Get selection's parent page
	var selPage;
	for (i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { selPage = selObj[i].parentPage; break };
	}
	if (selPage != null) {
		for (i = 0; i < selObj.length; i++) selObj[i].geometricBounds = pageBleedSize(selPage);
	} else alert("Please select an object not on pasteboard and try again.");
} else alert("Please select an object and try again.");
// END


function pageBleedSize(page) {
	var pageSize = page.bounds;
	var spreadPages = page.parent.pages; // Spread pages
	var firstPage = spreadPages.firstItem(); // First page of spread
	var lastPage = spreadPages.lastItem(); // Last page of spread
	var bleedMargins, m_y1, m_x1, m_y2, m_x2;
	bleedMargins = {
		top: doc.documentPreferences.properties.documentBleedTopOffset,
		left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
		bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
		right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
	}
	// Default is middle page
	m_x1 = pageSize[1];
	m_y1 = pageSize[0] - bleedMargins.top;
	m_x2 = pageSize[3];
	m_y2 = pageSize[2] + bleedMargins.bottom;
	if (spreadPages.length == 1) { // Spread is single page
		// Reverse left and right margins if left-hand page
		if (firstPage.side == PageSideOptions.LEFT_HAND) {
			bleedMargins.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
			bleedMargins.right = doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
		}
		m_x1 -= bleedMargins.left;
		m_x2 += bleedMargins.right;
	} else { // Spread is multiple pages
		switch (page) {
			case firstPage:
				// Reverse left and right margins if left-hand page
				if (firstPage.side == PageSideOptions.LEFT_HAND) {
					bleedMargins.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
				}
				m_x1 -= bleedMargins.left;
				break;
			case lastPage:
				m_x2 += bleedMargins.right;
				break;
		}
	}
	return [m_y1, m_x1, m_y2, m_x2];
}