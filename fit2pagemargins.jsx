/*
	Fit to page margins v1.1.4
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
	selObj[i].fit(FitOptions.FRAME_TO_CONTENT); // TODO
	selObj[i].geometricBounds = [
		Math.max(selObj[i].visibleBounds[0], size[0]),
		Math.max(selObj[i].visibleBounds[1], size[1]),
		Math.min(selObj[i].visibleBounds[2], size[2]),
		Math.min(selObj[i].visibleBounds[3], size[3])
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