/*
	Fit to page v1.2.10
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
	var obj = selObj[i]; if (obj.parentPage != page) continue;
	obj.fit(FitOptions.FRAME_TO_CONTENT); // TODO
	obj.geometricBounds = [
		Math.max(obj.visibleBounds[0], page.bounds[0]),
		Math.max(obj.visibleBounds[1], page.bounds[1]),
		Math.min(obj.visibleBounds[2], page.bounds[2]),
		Math.min(obj.visibleBounds[3], page.bounds[3])
	];
}