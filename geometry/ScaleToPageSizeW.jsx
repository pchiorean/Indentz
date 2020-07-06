/*
	Scale to page (left/right) v1.0.7
	© June 2020, Paul Chiorean
	This script scales the selected objects to the page left/right dimensions.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection, sel_BAK = sel;
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
var ungroup = false;
if (sel.length > 1) { // If multiple selection, temporarily group it
	var selArray = [];
	for (var i = 0; i < sel.length; i++) if (!sel[i].locked) selArray.push(sel[i]);
	sel = page.groups.add(selArray); ungroup = true;
} else sel = sel[0];

var pgW = page.bounds[3] - page.bounds[1];
var pgH = page.bounds[2] - page.bounds[0];
var objW = sel.visibleBounds[3] - sel.visibleBounds[1];
var objH = sel.visibleBounds[2] - sel.visibleBounds[0];
// Compute scale factor
var objSF = pgW / objW;
var matrix = app.transformationMatrices.add({ horizontalScaleFactor: objSF, verticalScaleFactor: objSF });
// Scale selection
sel.transform(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR, matrix);
doc.align(sel, DistributeOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
doc.align(sel, DistributeOptions.VERTICAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
// Ungroup and restore selection
if (ungroup) sel.ungroup();
app.select(sel_BAK);
// Restore layer grouping settings
app.generalPreferences.ungroupRemembersLayers = set_URL;
app.clipboardPreferences.pasteRemembersLayers = set_PRL;