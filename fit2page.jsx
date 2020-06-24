/*
	Fit to page v1.4.0
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
	var szA = sel[i].visibleBounds;
	var szB = sel[i].parentPage.bounds;
	sel[i].geometricBounds = [
		szA[2] > szB[0] ? Math.max(szA[0], szB[0]) : szA[0],
		szA[3] > szB[1] ? Math.max(szA[1], szB[1]) : szA[1],
		szA[0] < szB[2] ? Math.min(szA[2], szB[2]) : szA[2],
		szA[1] < szB[3] ? Math.min(szA[3], szB[3]) : szA[3]
	];
}