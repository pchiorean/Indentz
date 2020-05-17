/*
	Fit to spread bleedbox, forced v1.4.10
	© May 2020, Paul Chiorean
	This script resizes the selection to the spread bleedbox.
*/

var doc = app.activeDocument;
var selObj = doc.selection;
var selSp, sizeSpB;

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
		sizeSpB = bounds(selSp);
		for (i = 0; i < selObj.length; i++) selObj[i].geometricBounds = sizeSpB;
		doc.viewPreferences.rulerOrigin = ro; // Restore ruler origin setting
	} else alert("Please select an object not on pasteboard and try again.");
} else alert("Please select an object and try again.");


function bounds(spread) { // Return spread bleed bounds
	var fPg = spread.pages.firstItem();
	var lPg = spread.pages.lastItem();
	var sizeSp, bleed, m_y1, m_x1, m_y2, m_x2;
	sizeSp = fPg.bounds;
	bleed = {
		top: doc.documentPreferences.properties.documentBleedTopOffset,
		left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
		bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
		right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
	}
	if (spread.pages.length == 1) { // Spread is single page
		// Reverse left and right margins if left-hand page
		if (fPg.side == PageSideOptions.LEFT_HAND) {
			bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
			bleed.right = doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
		}
	} else { // Spread is multiple pages
		sizeSp = [fPg.bounds[0], fPg.bounds[1], lPg.bounds[2], lPg.bounds[3]];
		// Reverse left and right margins if left-hand page
		if (fPg.side == PageSideOptions.LEFT_HAND) {
			bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
		}
	}
	if (bleed.top + bleed.left + bleed.bottom + bleed.right != 0) {
		m_y1 = sizeSp[0] - bleed.top;
		m_x1 = sizeSp[1] - bleed.left;
		m_y2 = sizeSp[2] + bleed.bottom;
		m_x2 = sizeSp[3] + bleed.right;
		return [m_y1, m_x1, m_y2, m_x2];
	} else return sizeSp;
}