/*
	Doc cleanup v2.1.3
	© November 2020, Paul Chiorean
	Changes some settings, cleans up swatches/layers/pages and resets scaling.
*/

if (!(doc = app.activeDocument)) exit();

// Set preferences
app.doScript(File(app.activeScript.path + "/DefaultPrefs.jsx"), 
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set preferences");

// Delete unused swatches
app.doScript(
function() {
	var swa = doc.unusedSwatches;
	for (var i = 0; i < swa.length; i++) if (swa[i].name != "") swa[i].remove();
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Delete unused swatches");

// Turn off 'AutoUpdateURLStatus' from 'Hyperlinks' panel
app.doScript(
function() {
	var set_AUU = app.menuActions.itemByName("$ID/AutoUpdateURLStatus");
	var hyperLinksPanel = app.panels.itemByName("$ID/Hyperlinks");
	var flag_HLP = hyperLinksPanel.visible;
	if (!flag_HLP) hyperLinksPanel.visible = true;
	if (set_AUU.checked) set_AUU.invoke();
	hyperLinksPanel.visible = flag_HLP;
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Turn off 'AutoUpdateURLStatus'");

// Show 'guides' layer
app.doScript(
function() {
	try { doc.layers.item("guides").visible = true } catch (_) {
		try { doc.layers.item("Guides").visible = true } catch (_) {};
	}
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Show 'guides' layer");

// Delete guides
// app.doScript(
// function() {
// 	var g = doc.guides.everyItem().getElements();
// 	for (var i = 0; i < g.length; i++) if (g[i].label != "HW") g[i].remove();
// },
// ScriptLanguage.javascript, undefined,
// UndoModes.ENTIRE_SCRIPT, "Delete guides");

// Delete unused layers
app.doScript(
function() {
	try { app.menuActions.item("$ID/Delete Unused Layers").invoke() } catch (_) {};
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Delete unused layers");

// Delete empty spreads
app.doScript(
function() {
	var s = doc.spreads;
	for (var i = 0; i < s.length; i++) {
		if (s[i].pageItems.length == 0 && s.length > 1) { s[i].remove(); i-- }
	}
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Delete empty spreads");

// Unlock all items & redefine scaling to 100%
app.doScript(
function() {
	for (var i = 0; i < doc.spreads.length; i++) {
		var item, items = doc.spreads[i].allPageItems;
		while (item = items.shift()) {
			try { item.locked = false } catch (_) {};
			item.redefineScaling();
		}
	}
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Unlock all items & redefine scaling to 100%");
