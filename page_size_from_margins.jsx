/*
	Page size from page margins v1.2.0
	© April 2020, Paul Chiorean
	This script sets the page size to the page margins.
*/

var doc = app.activeDocument;
app.generalPreferences.objectsMoveWithPage = false;
doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;

for (var i = 0; i < doc.pages.length; i++) {
	var page = doc.pages[i];
	var pageMargins = page.marginPreferences;
	if (pageMargins.top + pageMargins.left + pageMargins.bottom + pageMargins.right != 0) {
		// Reverse left and right margins if left-hand page
		if (page.side == PageSideOptions.LEFT_HAND) {
			var m_x1 = page.bounds[1] + pageMargins.right;
			var m_x2 = page.bounds[3] - pageMargins.left;
		} else {
			var m_x1 = page.bounds[1] + pageMargins.left;
			var m_x2 = page.bounds[3] - pageMargins.right;
		}
		var m_y1 = page.bounds[0] + pageMargins.top;
		var m_y2 = page.bounds[2] - pageMargins.bottom;
		// Make temp rectangle
		var mg = page.rectangles.add({
			geometricBounds: [m_y1, m_x1, m_y2, m_x2],
			contentType: ContentType.UNASSIGNED, fillColor: "None", strokeColor: "None"
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
	var pageSize = { width: (page.bounds[3] - page.bounds[1]), height: (page.bounds[2] - page.bounds[0]) };
	try {
		doc.documentPreferences.pageWidth = pageSize.width;
		doc.documentPreferences.pageHeight = pageSize.height;
	} catch (e) {
		// Set master pages margins to zero
		var masterSpreads = doc.masterSpreads;
		for (s = 0; s < masterSpreads.length; s++) {
			var masterPages = masterSpreads[s].pages;
			for (i = 0; i < masterPages.length; i++) {
				masterPages[i].marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
			}
		}
		doc.documentPreferences.pageWidth = pageSize.width;
		doc.documentPreferences.pageHeight = pageSize.height;
	}
}
