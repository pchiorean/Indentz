/*
	Delete gremlins v1.4.7
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
for (var i = doc.unusedSwatches.length - 1; i >= 0; i--) {
	var name = doc.unusedSwatches[i].name;
	if (name != "") { doc.unusedSwatches[i].remove() };
}

// Step 3. Normalize similar CMYK swatches
// const __ = $.global.localize;
// const CM_PROCESS = +ColorModel.PROCESS;
// const CS_CMYK = +ColorSpace.CMYK;
// var swa, a, r, o, t, k, i;
// swa = doc.swatches;
// a = doc.colors.everyItem().properties;
// r = {};
// while (o = a.shift()) { // Gather CMYK swatches => {CMYK_Key => {id, name}[]}
// 	if (o.model != CM_PROCESS) continue;
// 	if (o.space != CS_CMYK) continue;
// 	t = swa.itemByName(o.name);
// 	if (!t.isValid) continue;
// 	if (t.name == "Safe area") continue;
// 	for (i = (k = o.colorValue).length; i--; k[i] = Math.round(k[i]));
// 	k = __("C=%1 M=%2 Y=%3 K=%4", k[0], k[1], k[2], k[3]);
// 	(r[k] || (r[k] = [])).push({ id: t.id, name: t.name });
// }
// for (k in r) {
// 	if (!r.hasOwnProperty(k)) continue;
// 	t = swa.itemByID((o = (a = r[k])[0]).id);
// 	for (i = a.length; --i; swa.itemByID(a[i].id).remove(t));
// 	if (k == o.name) continue; // No need to rename
// 	try { t.name = k } catch (_) {} // Prevent read-only errors
// }

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