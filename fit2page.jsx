/*
	Fit to page v1.2.5
	© May 2020, Paul Chiorean
	This script resizes the selection to the page size.
*/

var doc = app.activeDocument;
var selObj = doc.selection;

if (selObj.length > 0 && selObj[0].constructor.name != "Guide") {
	// Get selection's parent page
	var selPage;
	for (i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { selPage = selObj[i].parentPage; break };
	}
	if (selPage != null) {
		var pageSize = selPage.bounds;
		for (i = 0; i < selObj.length; i++) selObj[i].geometricBounds = pageSize;
	} else alert("Please select an object not on pasteboard and try again.");
} else alert("Please select an object and try again.");