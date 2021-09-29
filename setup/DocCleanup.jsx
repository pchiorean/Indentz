/*
	Doc cleanup v2.9 (2021-09-29)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Changes some settings, cleans up swatches/layers/pages and resets scaling.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

/* eslint-disable max-statements-per-line */

if (!(doc = app.activeDocument)) exit();
var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());

// Set preferences
app.doScript(File(script.path + '/DefaultPrefs.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set preferences');

// Turn off 'AutoUpdateURLStatus' from 'Hyperlinks' panel
app.doScript(function () {
	var setAUU = app.menuActions.itemByName('$ID/AutoUpdateURLStatus');
	var hyperLinksPanel = app.panels.itemByName('$ID/Hyperlinks');
	var oldHLP = hyperLinksPanel.visible;
	if (!oldHLP) hyperLinksPanel.visible = true;
	if (setAUU.checked) setAUU.invoke();
	hyperLinksPanel.visible = oldHLP;
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, "Turn off 'AutoUpdateURLStatus'");

// Show 'guides' layer
app.doScript(function () {
	var layer;
	if ((layer = doc.layers.item('guides')).isValid) layer.visible = true;
	if ((layer = doc.layers.item('Guides')).isValid) layer.visible = true;
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, "Show 'guides' layer");

// Unlock layers, items, delete hidden, reset scaling
app.doScript(function () {
	doc.layers.everyItem().locked = false;
	var item, askd, delHidden;
	var items = doc.pageItems.everyItem().getElements();
	while ((item = items.shift())) {
		if (item.locked) item.locked = false;
		if (!item.visible) {
			if (!askd) { delHidden = confirm('Delete hidden items?'); askd = true; }
			if (delHidden) { item.remove(); continue; }
		}
		try { item.redefineScaling(); } catch (e) {}
	}
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Unlock items, delete hidden, reset scaling');

// Clear default effects
app.doScript(function () {
	if ((menu = app.menuActions.item('$ID/Clear All Transparency')).enabled) menu.invoke();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Clear default effects');

// Delete unused layers
app.doScript(function () {
	if ((menu = app.menuActions.item('$ID/Delete Unused Layers')).enabled) menu.invoke();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Delete unused layers');

// Delete empty spreads
app.doScript(function () {
	var spread;
	var spreads = doc.spreads.everyItem().getElements();
	while ((spread = spreads.shift()))
		if (spread.allPageItems.length === 0 && doc.spreads.length > 1) spread.remove();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Delete empty spreads');

// Delete unused swatches
app.doScript(function () {
	var swatch;
	var swatches = doc.unusedSwatches;
	while ((swatch = swatches.shift()))
		if (swatch.name !== '') swatch.remove();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Delete unused swatches');

// Convert empty text frames to generic frames
app.doScript(function () {
	var frame;
	var frames = doc.textFrames.everyItem().getElements();
	while ((frame = frames.shift())) {
		if (/\s+$/g.test(frame.contents) && !frame.nextTextFrame)
			frame.contents = frame.contents.replace(/\s+$/g, '');
		if (frame.contents.length === 0) frame.contentType = ContentType.UNASSIGNED;
	}
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Convert empty text frames to generic frames');

doc.textPreferences.showInvisibles = false;

// Set pasteboard
app.doScript(function () {
	var P = { width: 150, height: 50 }; // Defaults (mm)
	var size = {
		width:  doc.spreads[0].pages.lastItem().bounds[3] - doc.spreads[0].pages.firstItem().bounds[1],
		height: doc.spreads[0].pages.lastItem().bounds[2] - doc.spreads[0].pages.firstItem().bounds[0]
	};
	var K = (size.width > 1000 && size.height > 1000) ? 10 : 1;
	doc.pasteboardPreferences.pasteboardMargins = [
		(size.width / size.height < 1.95) ? P.width  * K + 'mm' : P.width  / 1.5 * K + 'mm',
		(size.width / size.height < 1.95) ? P.height * K + 'mm' : P.height / 2.5 * K + 'mm'
	];
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set pasteboard');
