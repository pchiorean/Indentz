/*
	Document cleanup 22.3.11
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

	Changes some settings, cleans up swatches/layers/pages and resets scaling.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @include '../lib/ProgressBar.jsxinc';

var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());
var progressBar = new ProgressBar('Cleanup document', 10);

progressBar.update(1, 'Set preferences');
app.doScript(File(script.path + '/DefaultPrefs.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set preferences');

progressBar.update(2, 'Turn off auto update URLs');
app.doScript(function () {
	var setAUU = app.menuActions.itemByName('$ID/AutoUpdateURLStatus');
	var hyperLinksPanel = app.panels.itemByName('$ID/Hyperlinks');
	var oldHLP = hyperLinksPanel.visible;
	if (!oldHLP) hyperLinksPanel.visible = true;
	if (setAUU.checked) setAUU.invoke();
	hyperLinksPanel.visible = oldHLP;
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Turn off auto update URLs');

progressBar.update(3, 'Show guides');
app.doScript(function () {
	var layer;
	if ((layer = doc.layers.item('guides')).isValid) layer.visible = true;
	if ((layer = doc.layers.item('Guides')).isValid) layer.visible = true;
	doc.textPreferences.showInvisibles = false;
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Show guides');

progressBar.update(4, 'Unlock items, delete hidden, reset scaling');
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

progressBar.update(5, 'Clear default effects');
app.doScript(function () {
	if ((menu = app.menuActions.item('$ID/Clear All Transparency')).enabled) menu.invoke();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Clear default effects');

progressBar.update(6, 'Delete unused layers');
app.doScript(function () {
	if ((menu = app.menuActions.item('$ID/Delete Unused Layers')).enabled) menu.invoke();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Delete unused layers');

progressBar.update(7, 'Delete empty spreads');
app.doScript(function () {
	var spread;
	var spreads = doc.spreads.everyItem().getElements();
	while ((spread = spreads.shift()))
		if (spread.allPageItems.length === 0 && doc.spreads.length > 1) spread.remove();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Delete empty spreads');

progressBar.update(8, 'Delete unused swatches');
app.doScript(function () {
	var swatch;
	var swatches = doc.unusedSwatches;
	while ((swatch = swatches.shift()))
		if (swatch.name !== '') swatch.remove();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Delete unused swatches');

progressBar.update(9, 'Convert empty text frames to generic frames');
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

progressBar.update(10, 'Set pasteboard size');
app.doScript(function () {
	var P = { width: 150, height: 25 }; // Defaults (mm)
	var size = {
		width:  doc.spreads[0].pages.lastItem().bounds[3] - doc.spreads[0].pages.firstItem().bounds[1],
		height: doc.spreads[0].pages.lastItem().bounds[2] - doc.spreads[0].pages.firstItem().bounds[0]
	};
	var K = (size.width > 594 && size.height > 594) ? 10 : 1;
	doc.pasteboardPreferences.pasteboardMargins = [
		(size.width / size.height < 1.95) ? P.width  * K + 'mm' : P.width  / 1.5 * K + 'mm',
		(size.width / size.height < 1.95) ? P.height * K + 'mm' : P.height / 2.5 * K + 'mm'
	];
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set pasteboard size');

progressBar.close();
// app.select(null);
// app.activeWindow.zoom(ZoomOptions.FIT_SPREAD);
