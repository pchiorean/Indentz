/*
	Fit to page v1.2.8
	© June 2020, Paul Chiorean
	This script resizes the selection to the page size.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var selObj = doc.selection;
var selObj_y1, selObj_x1, selObj_y2, selObj_x2;
var selPg, sizePg;

if (selObj.length > 0 && selObj[0].constructor.name != "Guide") {
	// Get selection's parent page
	for (i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { selPg = selObj[i].parentPage; break };
	}
	// Resize selected object(s)
	if (selPg != null) {
		sizePg = selPg.bounds;
		for (i = 0; i < selObj.length; i++) {
			selObj[i].fit(FitOptions.FRAME_TO_CONTENT);
			selObj_y1 = Math.max(selObj[i].visibleBounds[0], sizePg[0]);
			selObj_x1 = Math.max(selObj[i].visibleBounds[1], sizePg[1]);
			selObj_y2 = Math.min(selObj[i].visibleBounds[2], sizePg[2]);
			selObj_x2 = Math.min(selObj[i].visibleBounds[3], sizePg[3]);
			selObj[i].geometricBounds = [selObj_y1, selObj_x1, selObj_y2, selObj_x2];
		}
	} else alert("Please select an object not on pasteboard and try again.");
} else alert("Please select an object and try again.");