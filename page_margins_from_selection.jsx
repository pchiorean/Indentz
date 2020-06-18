/*
	Page margins from selection v1.0.1
	© June 2020, Paul Chiorean
	This script sets the page margins to the selection bounds.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection; // Save selection
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Get selection's parent page
var selObj = sel, page;
for (var i = 0; i < selObj.length; i++) {
	if (selObj[i].parentPage != null) { page = selObj[i].parentPage; break };
}
if (page == null) { alert("Select an object on page and try again."); exit() };
// Get selection dimensions
var ungroup = false;
if (selObj.length > 1) { // If multiple selection, temporarily group it
	var objArr = [], lockedArr = [];
	for (var i = 0; i < selObj.length; i++) { // If locked, unlock and save index
		if (selObj[i].locked) { selObj[i].locked = false; lockedArr.push(i) };
		objArr.push(selObj[i]);
	}
	selObj = page.groups.add(objArr); ungroup = true;
} else selObj = selObj[0];
var size = selObj.visibleBounds;
for (var i = 1; i < selObj.getElements().length; i++) { // Iterate selection, get extremities
	size[0] = Math.min(selObj[i].visibleBounds[0], size[0]);
	size[1] = Math.min(selObj[i].visibleBounds[1], size[1]);
	size[2] = Math.max(selObj[i].visibleBounds[2], size[2]);
	size[3] = Math.max(selObj[i].visibleBounds[3], size[3]);
}
if (ungroup) { // Ungroup and restore locked state
	selObj.ungroup();
	for (var i = 0; i < lockedArr.length; i++) sel[lockedArr[i]].locked = true;
}
// Set page margins
page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
page.marginPreferences.properties = {
	top: size[0] - page.bounds[0],
	left: size[1] - page.bounds[1],
	bottom: page.bounds[2] - size[2],
	right: page.bounds[3] - size[3],
};
// Restore initial selection
try { app.select(sel) } catch (_) {};