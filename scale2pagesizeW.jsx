/*
	Scale to page (left/right) v1.0.5
	© June 2020, Paul Chiorean
	This script scales the selected objects to the page left/right dimensions.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var sel = doc.selection; // Save selection

if (sel.length > 0 && sel[0].constructor.name != "Guide") {
	// Get selection's parent page
	var selPg;
	for (i = 0; i < sel.length; i++) {
		if (sel[i].parentPage != null) { selPg = doc.pages[sel[i].parentPage.documentOffset]; break };
	}
	if (selPg != null) {
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
			selObj = selPg.groups.add(selObjArray); flagUngroup = true;
		} else selObj = selObj[0];
		var W_pg = selPg.bounds[3] - selPg.bounds[1];
		var H_pg = selPg.bounds[2] - selPg.bounds[0];
		var W_obj = selObj.visibleBounds[3] - selObj.visibleBounds[1];
		var H_obj = selObj.visibleBounds[2] - selObj.visibleBounds[0];
		// Compute scale factor
		var objSF = W_pg / W_obj;
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