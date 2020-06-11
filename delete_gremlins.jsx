/*
	Delete gremlins v1.6.1
	© June 2020, Paul Chiorean
	This script does some househeeping.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

// Step 0. Initialisation
doc.zeroPoint = [0, 0];
doc.guidePreferences.guidesShown = true;
doc.guidePreferences.guidesLocked = false;
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.showFrameEdges = true;
doc.viewPreferences.showRulers = true;
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;
app.activeWindow.transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
app.activeWindow.screenMode = ScreenModeOptions.PREVIEW_OFF;
doc.pageItemDefaults.fillColor = "None";
doc.pageItemDefaults.strokeColor = "None";
doc.selection = [];

// Step 1. Delete unused swatches
var i, swa; for (i = (swa = doc.unusedSwatches).length; i--; (swa[i].name != "") && swa[i].remove());

// Step 2. Turn off 'AutoUpdateURLStatus' from 'Hyperlinks' panel
var set_AUU = app.menuActions.itemByName("$ID/AutoUpdateURLStatus");
var hyperLinksPanel = app.panels.itemByName("$ID/Hyperlinks");
var flag_HLP = hyperLinksPanel.visible;
if (!flag_HLP) hyperLinksPanel.visible = true;
if (set_AUU.checked) set_AUU.invoke();
hyperLinksPanel.visible = flag_HLP;

// Step 3. Show 'guides' layer
try { doc.layers.item("guides").visible = true } catch (_) {
	try { doc.layers.item("Guides").visible = true } catch (_) {};
}

// Step 4. Delete unused layers
try { app.menuActions.item("$ID/Delete Unused Layers").invoke() } catch (_) {};

// Step 5. Delete empty spreads
for (var i = 0; i < doc.spreads.length; i++) {
	if (doc.spreads[i].pageItems.length == 0 && doc.spreads.length > 1) doc.spreads[i].remove();
}

// Step 6. Delete guides
try {
	var i, guide;
	for (i = (guide = doc.guides.everyItem().getElements()).length; i--; 
	(guide[i].label != "HW") && guide[i].remove());
} catch (_) {};