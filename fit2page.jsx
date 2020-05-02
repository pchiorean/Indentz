/*
	Fit to page v1.2.6
	© May 2020, Paul Chiorean
	This script resizes the selection to the page size.
*/

var doc = app.activeDocument;
var selObj = doc.selection;

if (selObj.length > 0 && selObj[0].constructor.name != "Guide") {
	// Get selection's parent page
	var selPg;
	for (i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { selPg = selObj[i].parentPage; break };
	}
	if (selPg != null) {
		var sizePg = selPg.bounds;
		for (i = 0; i < selObj.length; i++) selObj[i].geometricBounds = sizePg;
	} else alert("Please select an object not on pasteboard and try again.");
} else alert("Please select an object and try again.");