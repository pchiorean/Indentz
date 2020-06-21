/*
	Scale to page (left/right) v1.0.6
	© June 2020, Paul Chiorean
	This script scales the selected objects to the page left/right dimensions.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Get selection's parent page
var page;
for (var i = 0; i < sel.length; i++) {
	if (sel[i].parentPage != null) { page = doc.pages[sel[i].parentPage.documentOffset]; break };
}
if (page == null) { alert("Select an object on page and try again."); exit() };
// Remember layers for grouping/ungrouping
var set_URL = app.generalPreferences.ungroupRemembersLayers;
var set_PRL = app.clipboardPreferences.pasteRemembersLayers;
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;
// Get selection dimensions
var selObj = sel;
var ungroup = false;
if (selObj.length > 1) { // If multiple selection, temporarily group it
	var selObjArray = [];
	for (var i = 0; i < selObj.length; i++) if (!selObj[i].locked) selObjArray.push(selObj[i]);
	selObj = page.groups.add(selObjArray); ungroup = true;
} else selObj = selObj[0];

var pgW = page.bounds[3] - page.bounds[1];
var pgH = page.bounds[2] - page.bounds[0];
var objW = selObj.visibleBounds[3] - selObj.visibleBounds[1];
var objH = selObj.visibleBounds[2] - selObj.visibleBounds[0];
// Compute scale factor
var objSF = pgW / objW;
var matrix = app.transformationMatrices.add({ horizontalScaleFactor: objSF, verticalScaleFactor: objSF });
// Scale selection
selObj.transform(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR, matrix);
doc.align(selObj, DistributeOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
doc.align(selObj, DistributeOptions.VERTICAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
// Ungroup and restore selection
if (ungroup) selObj.ungroup();
app.select(sel);
// Restore layer grouping settings
app.generalPreferences.ungroupRemembersLayers = set_URL;
app.clipboardPreferences.pasteRemembersLayers = set_PRL;