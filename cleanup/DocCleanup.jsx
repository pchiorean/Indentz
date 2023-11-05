/*
	Document cleanup 23.11.5
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Changes some settings, cleans up swatches/layers/pages and other things.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @includepath '.;./lib;../lib';
// @include 'progressBar.jsxinc';

var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());
var progressBar = new ProgressBar('Cleaning document', 14);

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
	if ((menu = app.menuActions.item('$ID/Delete Unused Layers')).enabled) menu.invoke();
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Delete unused layers');

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
	var item;
	var items = doc.allPageItems;
	while ((item = items.shift())) {
		if (item.constructor.name !== 'TextFrame') continue;
		if (item.textFramePreferences.verticalJustification !== VerticalJustification.TOP_ALIGN) continue;
		if (item.textFramePreferences.autoSizingType !== AutoSizingTypeEnum.OFF) continue;
		if (!item.overflows && /\s+$/g.test(item.contents) && !item.nextTextFrame)
			item.contents = item.contents.replace(/\s+$/g, '');
		if (!item.overflows && item.lines.length === 1) item.lines[0].hyphenation = false;
		if (!item.overflows && item.contents.length === 0) item.contentType = ContentType.UNASSIGNED;
	}
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Convert empty text frames to generic frames');

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
			&& item.itemLayer !== 'dielines'
		) item.contentType = ContentType.GRAPHIC_TYPE;
	}
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Convert empty frames to graphic frames');

progressBar.update();
app.doScript(function () {
	var layer;
	if ((layer = doc.layers.itemByName('.guides')).isValid)       { layer.visible = true; layer.locked = false; }
	if ((layer = doc.layers.itemByName('.fold')).isValid)         { layer.visible = true; layer.locked = true; }
	if ((layer = doc.layers.itemByName('.safety area')).isValid)  { layer.visible = true; layer.locked = true; }
	if ((layer = doc.layers.itemByName('.segmentation')).isValid) { layer.visible = true; layer.locked = true; }
	if ((layer = doc.layers.itemByName('.visible area')).isValid) { layer.visible = true; layer.locked = true; }
	if ((layer = doc.layers.itemByName('.covered area')).isValid) { layer.visible = true; layer.locked = true; }
	if ((layer = doc.layers.itemByName('dielines')).isValid)      { layer.visible = true; layer.locked = true; }
	if ((layer = doc.layers.itemByName('varnish')).isValid)       { layer.visible = true; layer.locked = true; }
	if ((layer = doc.layers.itemByName('cutout')).isValid)        { layer.visible = true; layer.locked = true; }
	if ((layer = doc.layers.itemByName('HW')).isValid)            { layer.visible = true; layer.locked = true; }
	if ((layer = doc.layers.itemByName('on top')).isValid)        { layer.visible = true; layer.locked = true; }
	if ((layer = doc.layers.itemByName('text & logos')).isValid)  { layer.visible = true; layer.locked = false; }
	if ((layer = doc.layers.itemByName('artwork')).isValid)       { layer.visible = true; layer.locked = false; }
	if ((layer = doc.layers.itemByName('on bottom')).isValid)     { layer.visible = true; layer.locked = true; }
	if ((layer = doc.layers.itemByName('bg')).isValid)            { layer.visible = true; layer.locked = true; }
	if ((layer = doc.layers.itemByName('.reference')).isValid)    { layer.visible = false; layer.locked = true; }

	if ((layer = doc.layers.itemByName('text & logos')).isValid) doc.activeLayer = layer;
	else if ((layer = doc.layers.itemByName('artwork')).isValid) doc.activeLayer = layer;
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Show/hide layers');

progressBar.update();
doc.textPreferences.showInvisibles = false;

progressBar.update();
app.doScript(function () {
	app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
	var pbMargins = { w: 50, h: 50 };
	var spread = {
		w: doc.spreads[0].pages.lastItem().bounds[3] - doc.spreads[0].pages.firstItem().bounds[1],
		h: doc.spreads[0].pages.lastItem().bounds[2] - doc.spreads[0].pages.firstItem().bounds[0]
	};
	spread.aspect = spread.w / spread.h;
	// Fix large sizes
	var mult1K = {
		w: Math.min(Math.max(Math.floor((spread.w / 1000) % 1000), 1.0), 2),
		h: Math.min(Math.max(Math.floor((spread.h / 1000) % 1000), 0.5), 1)
	};
	pbMargins.w *= (spread.w >= 1000 ? mult1K.w * 5 : 3);
	pbMargins.h *= (spread.h >= 1000 ? 1 : mult1K.h);
	// Fix leaderboards
	if (spread.aspect > 4.95) {
		pbMargins.w /= 3;
		pbMargins.h /= 5;
	} /* else if (spread.aspect > 4.95) { pbMargins.h /= 2.5; } */
	doc.pasteboardPreferences.pasteboardMargins = [ pbMargins.w, pbMargins.h ];
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set pasteboard size');

progressBar.close();
// app.select(null);
// app.activeWindow.zoom(ZoomOptions.FIT_SPREAD);
