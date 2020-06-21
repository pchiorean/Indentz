/*
	Fit to page v1.3.0
	© June 2020, Paul Chiorean
	This script resizes the selection to the page size.
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
	var size = sel[i].parentPage.bounds;
	sel[i].fit(FitOptions.FRAME_TO_CONTENT);
	sel[i].geometricBounds = [
		Math.max(sel[i].visibleBounds[0], size[0]),
		Math.max(sel[i].visibleBounds[1], size[1]),
		Math.min(sel[i].visibleBounds[2], size[2]),
		Math.min(sel[i].visibleBounds[3], size[3])
	];
}