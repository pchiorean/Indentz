/*
	Fit to page v1.2.9
	© June 2020, Paul Chiorean
	This script resizes the selection to the page size.
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
for (var i = 0; i < selObj.length; i++) {
	selObj[i].fit(FitOptions.FRAME_TO_CONTENT); // TODO
	selObj[i].geometricBounds = [
		Math.max(selObj[i].visibleBounds[0], page.bounds[0]),
		Math.max(selObj[i].visibleBounds[1], page.bounds[1]),
		Math.min(selObj[i].visibleBounds[2], page.bounds[2]),
		Math.min(selObj[i].visibleBounds[3], page.bounds[3])
	];
}