/*
	Page size from page margins v1.2.3
	© June 2020, Paul Chiorean
	This script sets the page size to the page margins.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
app.generalPreferences.objectsMoveWithPage = false;
doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;

for (var i = 0; i < doc.pages.length; i++) {
	var page = doc.pages[i];
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
		// Make temp rectangle
		var mg = page.rectangles.add({
			geometricBounds: [m_y1, m_x1, m_y2, m_x2],
			contentType: ContentType.UNASSIGNED,
			fillColor: "None", strokeColor: "None"
		});
		// Set margins to zero
		page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }; // Page margins
		doc.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }; // Document margins
		// Resize page
		page.layoutRule = LayoutRuleOptions.OFF;
		var mg_TL = mg.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
		var mg_BR = mg.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
		page.reframe(CoordinateSpaces.SPREAD_COORDINATES, [mg_TL, mg_BR]);
		mg.remove(); // Remove temp rectangle
	}
}
// Also set document size
if (doc.pages.length == 1) {
	var sizePg = { width: (page.bounds[3] - page.bounds[1]), height: (page.bounds[2] - page.bounds[0]) };
	try {
		doc.documentPreferences.pageWidth = sizePg.width;
		doc.documentPreferences.pageHeight = sizePg.height;
	} catch (_) {
		// Set master pages margins to zero
		var masterPg;
		for (s = 0; s < doc.masterSpreads.length; s++) {
			masterPg = doc.masterSpreads[s].pages;
			for (i = 0; i < masterPg.length; i++) {
				masterPg[i].marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
			}
		}
		doc.documentPreferences.pageWidth = sizePg.width;
		doc.documentPreferences.pageHeight = sizePg.height;
	}
}