/*
	Delete gremlins v1.4.8
	© May 2020, Paul Chiorean
	This script does some househeeping.
*/

var doc = app.activeDocument;

// Step 1. Default settings
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

// Step 2. Delete unused swatches
var i, swa; for (i = (swa = doc.unusedSwatches).length; i--; (swa[i].name != "") && swa[i].remove());

// Step 3. Normalize similar CMYK swatches
// try {
// 	app.doScript(File(app.activeScript.path + "/normalize_swatches.jsx"), 
// 	ScriptLanguage.javascript, null, UndoModes.FAST_ENTIRE_SCRIPT, "Normalize similar CMYK swatches")
// } catch (_) {};

// Step 4. Show 'guides' layer
try { doc.layers.item("guides").visible = true } catch (_) {
	try { doc.layers.item("Guides").visible = true } catch (_) {};
};

// Step 5. Delete all guides
try { doc.guides.everyItem().remove() } catch (_) {};

// Step 6. Delete unused layers
try { app.menuActions.item("$ID/Delete Unused Layers").invoke() } catch (_) {};

// Step 7. Delete empty spreads
for (var i = 0; i < doc.spreads.length; i++) {
	if (doc.spreads[i].pageItems.length == 0 && doc.spreads.length > 1) doc.spreads[i].remove();
}