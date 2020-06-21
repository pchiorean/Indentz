/*
	Fit to page v1.2.11
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
var size = page.bounds;
for (var i = 0; i < selObj.length; i++) {
	var obj = selObj[i];
	if (obj.parentPage != page) continue;
	if (obj.constructor.name != "Rectangle") continue; // TODO
	obj.fit(FitOptions.FRAME_TO_CONTENT);
	obj.geometricBounds = [
		Math.max(obj.visibleBounds[0], size[0]),
		Math.max(obj.visibleBounds[1], size[1]),
		Math.min(obj.visibleBounds[2], size[2]),
		Math.min(obj.visibleBounds[3], size[3])
	];
}