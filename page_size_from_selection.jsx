/*
	Page size from selection v1.5.1
	© June 2020, Paul Chiorean
	This script sets the page size to the selection bounds.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
app.generalPreferences.objectsMoveWithPage = false;
doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;

var sel = doc.selection; // Save selection
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) { alert("Select an object and try again."); exit() };

// Get selection's parent page
var selObj = sel;
var s = selObj[0].parent; while (s.constructor.name != "Spread") s = s.parent; var page = s.pages[0];
for (var i = 0; i < selObj.length; i++) if (selObj[i].parentPage != null) { page = selObj[i].parentPage; break };

// If multiple selection, temporarily group it
var flagUngroup = false;
if (selObj.length > 1) {
	var selObjArray = [], selObjLockedArray = [];
	for (var i = 0; i < selObj.length; i++) { // If locked, unlock and save index
		if (selObj[i].locked) { selObj[i].locked = false; selObjLockedArray.push(i) };
		selObjArray.push(selObj[i]);
	}
	selObj = page.groups.add(selObjArray); flagUngroup = true;
} else { selObj = selObj[0] };
// Get selection bounds
var objBounds = selObj.visibleBounds;
for (var i = 1; i < selObj.getElements().length; i++) {
	// Top-left corner
	objBounds[0] = Math.min(selObj[i].visibleBounds[0], objBounds[0]);
	objBounds[1] = Math.min(selObj[i].visibleBounds[1], objBounds[1]);
	// Bottom-right corner
	objBounds[2] = Math.max(selObj[i].visibleBounds[2], objBounds[2]);
	objBounds[3] = Math.max(selObj[i].visibleBounds[3], objBounds[3]);
}
// Ungroup and restore locked state
if (flagUngroup) {
	try { selObj.ungroup(); flagUngroup = false } catch (_) {};
	for (var i = 0; i < selObjLockedArray.length; i++) sel[selObjLockedArray[i]].locked = true;
}
// Make temp rectangle and resolve TL-BR
var mg = page.rectangles.add({
	geometricBounds: objBounds, contentType: ContentType.UNASSIGNED, fillColor: "None", strokeColor: "None"
});
var mg_TL = mg.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
var mg_BR = mg.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
mg.remove(); // Remove temp rectangle

// Resize page
page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }; // Set page mgs to zero
doc.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }; // Set doc mgs to zero
page.layoutRule = LayoutRuleOptions.OFF; // Don't scale page items
page.reframe(CoordinateSpaces.SPREAD_COORDINATES, [mg_TL, mg_BR]);
if (flagUngroup) try { selObj.ungroup() } catch (_) {};
// Also set document size
var sizePg = { width: objBounds[3] - objBounds[1], height: objBounds[2] - objBounds[0] };
if (doc.pages.length == 1) {
	try {
		doc.documentPreferences.pageWidth = sizePg.width;
		doc.documentPreferences.pageHeight = sizePg.height;
	} catch (_) {
		// Set master pages margins to zero
		for (var s = 0; s < doc.masterSpreads.length; s++) {
			var masterPg = doc.masterSpreads[s].pages;
			for (var i = 0; i < masterPg.length; i++) masterPg[i].marginPreferences.properties = [0, 0, 0, 0];
		}
		doc.documentPreferences.pageWidth = sizePg.width;
		doc.documentPreferences.pageHeight = sizePg.height;
	}
}
// Restore initial selection
app.select(sel);