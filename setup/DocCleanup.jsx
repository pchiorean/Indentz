/*
	Doc cleanup v2.5.2 (2021-06-18)
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

// Unlock layers, items, delete hidden, reset scaling
app.doScript(
function() {
	doc.layers.everyItem().locked = false;
	var item, items = doc.pageItems.everyItem().getElements();
	var askd, delHidden;
	while (item = items.shift()) {
		if (item.locked) item.locked = false;
		if (!item.visible) {
			if (!askd) { delHidden = confirm("Delete hidden items?"); askd = true };
			if (delHidden) { item.remove(); continue };
		};
		try { item.redefineScaling() } catch (e) {};
	};
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Unlock items, delete hidden, reset scaling");

// Delete unused layers
app.doScript(
function() {
	if ((menu = app.menuActions.item("$ID/Delete Unused Layers")).enabled) menu.invoke();
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Delete unused layers");

// Delete empty spreads
app.doScript(
function() {
	for (var i = 0, s = doc.spreads; i < s.length; i++)
		if (s[i].pageItems.length == 0 && s.length > 1) { s[i].remove(); i-- };
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Delete empty spreads");

// Delete unused swatches
app.doScript(
function() {
	var item, items = doc.unusedSwatches;
	while (item = items.shift()) if (item.name != "") item.remove();
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Delete unused swatches");

// Convert empty text frames to generic frames
app.doScript(
function() {
	var item, items = doc.textFrames.everyItem().getElements();
	while (item = items.shift()) {
		if (/\s+$/g.test(item.contents) && item.nextTextFrame == null)
			item.contents = item.contents.replace(/\s+$/g, "");
		if (item.contents.length == 0) item.contentType = ContentType.UNASSIGNED;
	};
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Convert empty text frames to generic frames");

doc.textPreferences.showInvisibles = false;

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
