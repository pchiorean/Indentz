/*
	Doc cleanup v2.7 (2021-08-26)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Changes some settings, cleans up swatches/layers/pages and resets scaling.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();
var script = function() { try { return app.activeScript } catch(e) { return new File(e.fileName) } }();

// Set preferences
app.doScript(File(script.path + "/DefaultPrefs.jsx"),
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set preferences");

// Turn off 'AutoUpdateURLStatus' from 'Hyperlinks' panel
app.doScript(function () {
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
app.doScript(function () {
	var layer;
	if ((layer = doc.layers.item("guides")).isValid) layer.visible = true;
	if ((layer = doc.layers.item("Guides")).isValid) layer.visible = true;
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Show 'guides' layer");

// Unlock layers, items, delete hidden, reset scaling
app.doScript(function () {
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
app.doScript(function () {
	if ((menu = app.menuActions.item("$ID/Delete Unused Layers")).enabled) menu.invoke();
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Delete unused layers");

// Delete empty spreads
app.doScript(function () {
	var spread, spreads = doc.spreads.everyItem().getElements();
	while (spread = spreads.shift()) {
		if (spread.allPageItems.length == 0 && doc.spreads.length > 1) spread.remove();
	};
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Delete empty spreads");

// Delete unused swatches
app.doScript(function () {
	var swatch, swatches = doc.unusedSwatches;
	while (swatch = swatches.shift()) {
		if (swatch.name != "") swatch.remove();
	};
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Delete unused swatches");

// Convert empty text frames to generic frames
app.doScript(function () {
	var frame, frames = doc.textFrames.everyItem().getElements();
	while (frame = frames.shift()) {
		if (/\s+$/g.test(frame.contents) && frame.nextTextFrame == null)
			frame.contents = frame.contents.replace(/\s+$/g, "");
		if (frame.contents.length == 0) frame.contentType = ContentType.UNASSIGNED;
	};
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Convert empty text frames to generic frames");

// Fix paragraphs end leading
app.doScript(function () {
	var story, stories = doc.stories.everyItem().getElements();
	while (story = stories.shift()) {
		var paragraph, paragraphs = story.paragraphs.everyItem().getElements();
		while (paragraph = paragraphs.shift()) {
			if (paragraph.characters.length > 1 && paragraph.characters[-1].contents == "\r") {
				paragraph.characters[-1].pointSize = paragraph.characters[-2].pointSize;
				paragraph.characters[-1].leading = paragraph.characters[-2].leading;
			};
		};
	};
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Fix paragraphs end leading");

doc.textPreferences.showInvisibles = false;

// Set pasteboard
app.doScript(function () {
	const P = { width: 150, height: 50 }; // Defaults (mm)
	var size = {
		width: doc.spreads[0].pages.lastItem().bounds[3] - doc.spreads[0].pages.firstItem().bounds[1],
		height: doc.spreads[0].pages.lastItem().bounds[2] - doc.spreads[0].pages.firstItem().bounds[0]
	};
	const K = (size.width > 1000 && size.height > 1000) ? 10 : 1;
	doc.pasteboardPreferences.pasteboardMargins = [
		(size.width / size.height < 1.95) ? P.width*K + "mm" : P.width/1.5*K + "mm",
		(size.width / size.height < 1.95) ? P.height*K + "mm" : P.height/2.5*K + "mm"
	];
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set pasteboard");
