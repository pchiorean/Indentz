﻿/*
	Doc cleanup v2.4.2 (2021-05-28)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Changes some settings, cleans up swatches/layers/pages and resets scaling.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// Set preferences
app.doScript(File(app.activeScript.path + "/DefaultPrefs.jsx"), 
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set preferences");

// Turn off 'AutoUpdateURLStatus' from 'Hyperlinks' panel
app.doScript(
function() {
	var setAUU = app.menuActions.itemByName("$ID/AutoUpdateURLStatus");
	var hyperLinksPanel = app.panels.itemByName("$ID/Hyperlinks");
	var oldHLP = hyperLinksPanel.visible;
	if (!oldHLP) hyperLinksPanel.visible = true;
	if (setAUU.checked) setAUU.invoke();
	hyperLinksPanel.visible = oldHLP;
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Turn off 'AutoUpdateURLStatus'");

// Show 'guides' layer
app.doScript(
function() {
	var layer;
	if ((layer = doc.layers.item("guides")).isValid) layer.visible = true;
	if ((layer = doc.layers.item("Guides")).isValid) layer.visible = true;
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Show 'guides' layer");

// Delete unused swatches
app.doScript(
function() {
	var swa = doc.unusedSwatches;
	for (var i = 0; i < swa.length; i++) if (swa[i].name != "") swa[i].remove();
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Delete unused swatches");

// Delete unused layers
app.doScript(
function() {
	if ((menu_DUL = app.menuActions.item("$ID/Delete Unused Layers")).enabled) menu_DUL.invoke();
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

// Delete guides
// app.doScript(
// function() {
// 	var g = doc.guides.everyItem().getElements();
// 	for (var i = 0; i < g.length; i++) if (g[i].label != "HW") g[i].remove();
// },
// ScriptLanguage.javascript, undefined,
// UndoModes.ENTIRE_SCRIPT, "Delete guides");

// Unlock all items & redefine scaling to 100%
app.doScript(
function() {
	var item, items = doc.allPageItems;
	while (item = items.shift()) {
		if (item.locked == true) item.locked = false;
		try { item.redefineScaling() } catch (e) {};
	}
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Unlock all items & redefine scaling to 100%");

// Convert empty text frames to generic frames
app.doScript(
function() {
	var item, items = doc.textFrames.everyItem().getElements();
	while (item = items.shift()) {
		if (/\s+$/g.test(item.contents) && item.nextTextFrame == null)
			item.contents = item.contents.replace(/\s+$/g, "");
		if (item.contents.length == 0) item.contentType = ContentType.UNASSIGNED;
	}
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Convert empty text frames to generic frames");

// Set pasteboard
app.doScript(function() {
	var size = {
		width: doc.spreads[0].pages.lastItem().bounds[3] - doc.spreads[0].pages.firstItem().bounds[1],
		height: doc.spreads[0].pages.lastItem().bounds[2] - doc.spreads[0].pages.firstItem().bounds[0]
	};
	doc.pasteboardPreferences.pasteboardMargins = [
		((size.width / size.height) < 1.95 ? "150 mm" : "50 mm"),
		((size.width / size.height) < 1.95 ? "25 mm" : "10 mm")
	];
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set pasteboard");
