/*
	Page size from selection v1.4.7
	© June 2020, Paul Chiorean
	This script sets the page size to the selection bounds.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
app.generalPreferences.objectsMoveWithPage = false;
doc.adjustLayoutPreferences.enableAdjustLayout = false;
doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;

var sel = doc.selection; // Save selection
if (sel.length > 0 && sel[0].constructor.name != "Guide") {
	// Get selection's parent page
	var selObj = sel;
	var selPg = selObj[0].parent.pages[0]; // 1st page of parent spread, as backup
	for (i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { selPg = selObj[i].parentPage; break };
	}
	// If multiple selection, temporarily group it
	var flagUngroup = false;
	if (selObj.length > 1) {
		var selObjArray = [], selObjLockedArray = [];
		for (i = 0; i < selObj.length; i++) {
			// If locked, unlock and save index
			if (selObj[i].locked) { selObj[i].locked = false; selObjLockedArray.push(i) };
			selObjArray.push(selObj[i]);
		}
		selObj = selPg.groups.add(selObjArray); flagUngroup = true;
	} else {
		selObj = selObj[0];
	}
	// Set margins to zero
	selPg.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }; // Page margins
	doc.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }; // Document margins
	// Resize page
	selPg.layoutRule = LayoutRuleOptions.OFF; // Don't scale page items
	var selObjTL = selObj.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
	var selObjBR = selObj.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0];
	var sizePg = { width: (selObjBR[0] - selObjTL[0]), height: (selObjBR[1] - selObjTL[1]) };
	selPg.reframe(CoordinateSpaces.SPREAD_COORDINATES, [selObjTL, selObjBR]);
	// Ungroup and restore locked state
	if (flagUngroup) {
		selObj.ungroup();
		for (i = 0; i < selObjLockedArray.length; i++) sel[selObjLockedArray[i]].locked = true;
	}
	// Also set document size
	if (doc.pages.length == 1) {
		try {
			doc.documentPreferences.pageWidth = sizePg.width;
			doc.documentPreferences.pageHeight = sizePg.height;
		} catch (_) {
			// Set master pages margins to zero
			var masterPg;
			for (s = 0; s < doc.masterSpreads.length; s++) {
				masterPg = doc.masterSpreads[s].pages;
				for (i = 0; i < masterPg.length; i++) {
					masterPg[i].marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
				}
			}
			doc.documentPreferences.pageWidth = sizePg.width;
			doc.documentPreferences.pageHeight = sizePg.height;
		}
	}
	app.select(sel); // Restore initial selection
} else alert("Select an object and try again.");