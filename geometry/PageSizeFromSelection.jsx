/*
	Page size from selection v1.6.0
	© June 2020, Paul Chiorean
	This script sets the page size to the selected objects bounds.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
app.generalPreferences.objectsMoveWithPage = false;
doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;

var sel = doc.selection; // Save selection
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Get selection's parent page
var selObj = sel; var s = selObj[0].parent;
while (s.constructor.name != "Spread") s = s.parent; var page = s.pages[0];
for (var i = 0; i < selObj.length; i++) {
	if (selObj[i].parentPage != null) { page = selObj[i].parentPage; break };
}
// Get selection dimensions
var size = selObj[0].visibleBounds;
for (var i = 1; i < selObj.length; i++) { // Iterate selection, get extremities
	size[0] = Math.min(selObj[i].visibleBounds[0], size[0]);
	size[1] = Math.min(selObj[i].visibleBounds[1], size[1]);
	size[2] = Math.max(selObj[i].visibleBounds[2], size[2]);
	size[3] = Math.max(selObj[i].visibleBounds[3], size[3]);
}
var mg = page.rectangles.add({ // Make temp rectangle and resolve TL-BR
	geometricBounds: size, contentType: ContentType.UNASSIGNED, fillColor: "None", strokeColor: "None"
});
var mg_TL = mg.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
var mg_BR = mg.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
mg.remove(); // Remove temp rectangle
// Resize page
page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }; // Page margins
doc.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }; // Document margins
page.layoutRule = LayoutRuleOptions.OFF; // Don't scale page items
page.reframe(CoordinateSpaces.SPREAD_COORDINATES, [mg_TL, mg_BR]);
// Also set document size
var sizePg = { width: size[3] - size[1], height: size[2] - size[0] };
if (doc.pages.length == 1) {
	try {
		doc.documentPreferences.pageWidth = sizePg.width;
		doc.documentPreferences.pageHeight = sizePg.height;
	} catch (_) {
		for (var s = 0; s < doc.masterSpreads.length; s++) { // Set master pages margins to zero
			var masterPg = doc.masterSpreads[s].pages;
			for (var i = 0; i < masterPg.length; i++) 
			masterPg[i].marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
		}
		doc.documentPreferences.pageWidth = sizePg.width;
		doc.documentPreferences.pageHeight = sizePg.height;
	}
}
try { app.select(sel) } catch (_) {}; // Restore initial selection