/*
	Scale to page (top/bottom) v1.0.3
	© May 2020, Paul Chiorean
	This script scales the selected objects to the page top/bottom dimensions.
*/

var doc = app.activeDocument;
var sel = doc.selection; // Save selection

if (sel.length > 0 && sel[0].constructor.name != "Guide") {
	// Get selection's parent page
	var selPage;
	for (i = 0; i < sel.length; i++) {
		if (sel[i].parentPage != null) { selPage = doc.pages[sel[i].parentPage.documentOffset]; break };
	}
	if (selPage != null) {
		// Remember layers for grouping/ungrouping
		var set_uRL = app.generalPreferences.ungroupRemembersLayers;
		var set_pRL = app.clipboardPreferences.pasteRemembersLayers;
		app.generalPreferences.ungroupRemembersLayers = true;
		app.clipboardPreferences.pasteRemembersLayers = true;
		// Get selection dimensions
		var selObj = sel;
		var flagUngroup = false;
		if (selObj.length > 1) { // If multiple selection, temporarily group it
			var selObjArray = [];
			for (i = 0; i < selObj.length; i++) {
				if (!selObj[i].locked) selObjArray.push(selObj[i]);
			}
			selObj = selPage.groups.add(selObjArray); flagUngroup = true;
		} else selObj = selObj[0];
		var W_pg = selPage.bounds[3] - selPage.bounds[1];
		var H_pg = selPage.bounds[2] - selPage.bounds[0];
		var W_obj = selObj.visibleBounds[3] - selObj.visibleBounds[1];
		var H_obj = selObj.visibleBounds[2] - selObj.visibleBounds[0];
		// Compute scale factor
		var objSF = H_pg / H_obj;
		var matrix = app.transformationMatrices.add({
			horizontalScaleFactor: objSF,
			verticalScaleFactor: objSF
		});
		// Scale selection
		selObj.transform(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR, matrix);
		doc.align(selObj, DistributeOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
		doc.align(selObj, DistributeOptions.VERTICAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
		// Ungroup and restore selection
		if (flagUngroup) selObj.ungroup();
		app.select(sel);
		// Restore layer grouping settings
		app.generalPreferences.ungroupRemembersLayers = set_uRL;
		app.clipboardPreferences.pasteRemembersLayers = set_pRL;
	} else alert("Please select an object not on pasteboard and try again.");
} else alert("Please select an object and try again.");