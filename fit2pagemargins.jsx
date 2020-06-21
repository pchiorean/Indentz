/*
	Fit to page margins v1.2.0
	© June 2020, Paul Chiorean
	This script resizes the selection to the page margins.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Resize selected object(s)
for (var i = 0; i < sel.length; i++) {
	if (sel[i].constructor.name != "Rectangle") continue;
	if (sel[i].parentPage == null) continue;
	var size = bounds(sel[i].parentPage);
	sel[i].fit(FitOptions.FRAME_TO_CONTENT);
	sel[i].geometricBounds = [
		Math.max(sel[i].visibleBounds[0], size[0]),
		Math.max(sel[i].visibleBounds[1], size[1]),
		Math.min(sel[i].visibleBounds[2], size[2]),
		Math.min(sel[i].visibleBounds[3], size[3])
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