/*
	Document cleanup 24.8.15
	(c) 2020-2024 Paul Chiorean <jpeg@basement.ro>

	Changes some settings, cleans up swatches/layers/pages and other things.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @includepath '.;./lib;../lib;../../lib';
// @include 'progressBar.jsxinc';

var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());
var progressBar = new ProgressBar('Cleaning document', 14);
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;

progressBar.update();
app.doScript(File(script.path + '/DefaultPrefs.jsx'),
	ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Set preferences');

progressBar.update();
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

progressBar.update();
app.doScript(function () {
	doc.layers.everyItem().locked = false;
	var item;
	var items = doc.allPageItems;
	while ((item = items.shift())) {
		if (item.locked) item.locked = false;
		try { item.redefineScaling(); } catch (e) {}
	}
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Unlock items and reset scaling');

progressBar.update();
app.doScript(function () {
	var item, delHidden;
	var items = doc.pageItems.everyItem().getElements();
	while ((item = items.shift())) {
		if (item.visible) continue;
		if (delHidden === undefined) delHidden = confirm('Delete hidden items?');
		if (delHidden) item.remove();
	}
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Delete hidden items');

progressBar.update();
app.doScript(function () {
	var item, delEmpty;
	var items = doc.pageItems.everyItem().getElements();
	while ((item = items.shift())) {
		if (/Oval|Rectangle|Polygon/.test(item.constructor.name)
				&& item.allPageItems.length === 0
				&& item.textPaths.length === 0
				&& item.strokeWeight === 0 && item.fillColor.name === 'None') {
			if (delEmpty === undefined) delEmpty = confirm('Delete empty frames?');
			if (delEmpty && !/\.?guides/.test(item.itemLayer.name)) item.remove();
		}
	}
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Delete empty frames');

progressBar.update();
app.doScript(function () {
	if ((menu = app.menuActions.item('$ID/Clear All Transparency')).enabled) menu.invoke();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Clear default effects');

progressBar.update();
app.doScript(function () {
	var swatch;
	var swatches = doc.unusedSwatches;
	while ((swatch = swatches.shift()))
		if (swatch.name !== '') swatch.remove();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Delete unused swatches');

progressBar.update();
app.doScript(function () {
	if ((menu = app.menuActions.item('$ID/Delete Unused Layers')).enabled) menu.invoke();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Delete unused layers');

progressBar.update();
app.doScript(function () {
	var item;
	var items = doc.allPageItems;
	while ((item = items.shift())) {
		if (item.constructor.name !== 'TextFrame') continue;
		if (item.previousTextFrame || item.nextTextFrame) continue;
		if (item.textFramePreferences.verticalJustification !== VerticalJustification.TOP_ALIGN) continue;
		if (item.textFramePreferences.autoSizingType !== AutoSizingTypeEnum.OFF) continue;
		if (!item.overflows && /\s+$/g.test(item.contents)) item.contents = item.contents.replace(/\s+$/g, '');
		if (!item.overflows && item.lines.length === 1) item.lines[0].hyphenation = false;
		if (!item.overflows && item.contents.length === 0) item.contentType = ContentType.UNASSIGNED;
	}
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Clean text frames');

progressBar.update();
app.doScript(function () {
	var item;
	var items = doc.allPageItems;
	while ((item = items.shift())) {
		if (/Oval|Rectangle|Polygon/.test(item.constructor.name)
			&& item.allPageItems.length === 0
			&& item.fillColor.name === 'None'
			&& item.strokeColor.name === 'None'
			&& item.strokeWeight === 0
			// Skip dielines
			&& (item.itemLayer !== '+dielines' || item.itemLayer !== 'dielines')
		) item.contentType = ContentType.GRAPHIC_TYPE;
	}
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Convert empty frames to graphic frames');

progressBar.update();
app.doScript(function () {
	app.doScript(File(script.path + '/../Assets/ResetLayers.jsx'), ScriptLanguage.JAVASCRIPT);
	var layer;
	// Set active layer
	if ((layer = doc.layers.itemByName('copy')).isValid) doc.activeLayer = layer;
	else if ((layer = doc.layers.itemByName('text & logos')).isValid) doc.activeLayer = layer;
	else if ((layer = doc.layers.itemByName('artwork')).isValid) doc.activeLayer = layer;
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Reset layers state');

progressBar.update();
app.doScript(function () {
	var spread;
	var spreads = doc.spreads.everyItem().getElements();
	while ((spread = spreads.shift()))
		if (spread.allPageItems.length === 0 && doc.spreads.length > 1) spread.remove();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Delete empty spreads');

progressBar.update();
doc.textPreferences.showInvisibles = false;

progressBar.update();
app.doScript(function () {
	var pbMargins = { w: 50, h: 10 };
	var spread = {
		w: doc.spreads[0].pages.lastItem().bounds[3] - doc.spreads[0].pages.firstItem().bounds[1],
		h: doc.spreads[0].pages.lastItem().bounds[2] - doc.spreads[0].pages.firstItem().bounds[0]
	};
	var isLarge = (spread.w >= UnitValue('1000 mm') || spread.h >= UnitValue('1000 mm'));

	pbMargins.w *= (isLarge ? 5 : 1);
	pbMargins.h *= (isLarge ? 5 : 1);
	doc.pasteboardPreferences.pasteboardMargins = [ pbMargins.w, pbMargins.h ];
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set pasteboard size');

progressBar.close();
