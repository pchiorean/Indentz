/*
	Fit to page margins v1.1.5
	© June 2020, Paul Chiorean
	This script resizes the selection to the page margins.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Get selection's parent page
var selObj = sel, page;
for (var i = 0; i < selObj.length; i++) {
	if (selObj[i].parentPage != null) { page = selObj[i].parentPage; break };
}
if (page == null) { alert("Select an object on page and try again."); exit() };
// Resize selected object(s)
var size = bounds(page);
for (var i = 0; i < selObj.length; i++) {
	var obj = selObj[i]; if (obj.parentPage != page) continue;
	obj.fit(FitOptions.FRAME_TO_CONTENT); // TODO
	obj.geometricBounds = [
		Math.max(obj.visibleBounds[0], page.bounds[0]),
		Math.max(obj.visibleBounds[1], page.bounds[1]),
		Math.min(obj.visibleBounds[2], page.bounds[2]),
		Math.min(obj.visibleBounds[3], page.bounds[3])
	];
}


function bounds(page) { // Return page margins bounds
	var size = [
		page.bounds[0] + page.marginPreferences.top,
		page.bounds[1] + page.marginPreferences.left,
		page.bounds[2] - page.marginPreferences.bottom,
		page.bounds[3] - page.marginPreferences.right
	]
	// Reverse left and right margins if left-hand page
	if (page.side == PageSideOptions.LEFT_HAND) {
		size[1] = page.bounds[1] + page.marginPreferences.right;
		size[3] = page.bounds[3] - page.marginPreferences.left;
	}
	return size;
}