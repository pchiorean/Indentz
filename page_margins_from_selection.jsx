/*
	Page margins from selection v1.0.0
	© June 2020, Paul Chiorean
	This script sets the page margins to the selection bounds.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
app.generalPreferences.objectsMoveWithPage = false;
doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;

var sel = doc.selection; // Save selection
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) { alert("Select an object and try again."); exit() };
// Get selection's parent page
var selObj = sel, page;
for (var i = 0; i < selObj.length; i++) if (selObj[i].parentPage != null) { page = selObj[i].parentPage; break };
if (page == null) { alert("Select an object on page and try again."); exit() };
// Get selection dimensions
var flagUngroup = false;
if (selObj.length > 1) { // If multiple selection, temporarily group it
	var selObjArray = [], selObjLockedArray = [];
	for (var i = 0; i < selObj.length; i++) { // If locked, unlock and save index
		if (selObj[i].locked) { selObj[i].locked = false; selObjLockedArray.push(i) };
		selObjArray.push(selObj[i]);
	}
	selObj = page.groups.add(selObjArray); flagUngroup = true;
} else selObj = selObj[0];
var objBounds = selObj.visibleBounds;
for (var i = 1; i < selObj.getElements().length; i++) { // Iterate selection, get extremities
	// Top-left corner
	objBounds[0] = Math.min(selObj[i].visibleBounds[0], objBounds[0]);
	objBounds[1] = Math.min(selObj[i].visibleBounds[1], objBounds[1]);
	// Bottom-right corner
	objBounds[2] = Math.max(selObj[i].visibleBounds[2], objBounds[2]);
	objBounds[3] = Math.max(selObj[i].visibleBounds[3], objBounds[3]);
}
if (flagUngroup) { // Ungroup and restore locked state
	selObj.ungroup();
	for (var i = 0; i < selObjLockedArray.length; i++) sel[selObjLockedArray[i]].locked = true;
}
// Set page margins
page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
var mgPg = {
	top: (objBounds[0] - page.bounds[0]),
	left: (objBounds[1] - page.bounds[1]),
	bottom: (page.bounds[2] - objBounds[2]),
	right: (page.bounds[3] - objBounds[3]),
}
page.marginPreferences.properties = mgPg;
try { app.select(sel) } catch (_) {}; // Restore initial selection