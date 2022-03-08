// @include '../lib/ProgressBar.jsxinc';

if (!(doc = app.activeDocument)) exit();
var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());
var progressBar = new ProgressBar('Set document defaults', 7);

// Set preferences
progressBar.update(1, 'Set preferences');
app.doScript(File(script.path + '/DefaultPrefs.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set preferences');

// Add default swatches
progressBar.update(2, 'Set default swatches');
app.doScript(File(script.path + '/DefaultSwatches.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Default swatches');

// Add default layers
progressBar.update(3, 'Set default layers');
app.doScript(File(script.path + '/DefaultLayers.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Default layers');

// Replace fonts
progressBar.update(4, 'Replace fonts');
app.doScript(File(script.path + '/ReplaceFonts.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Replace fonts');

// Replace links
progressBar.update(5, 'Replace links');
app.doScript(File(script.path + '/ReplaceLinks.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Replace links');

progressBar.update(6, '');
doc.textPreferences.showInvisibles = true;

progressBar.update(7, 'Set page dimensions & pasteboard');
app.doScript(function () {
	// Set page dimensions from filename
	app.doScript(File(script.path + '/../layout/PageSizeFromFilename.jsx'),
	ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Set page dimensions');
	// Set pasteboard
	doc.pasteboardPreferences.pasteboardMargins = [
		doc.pages[0].bounds[3] - doc.pages[0].bounds[1],
		(doc.pages[0].bounds[2] - doc.pages[0].bounds[0]) / 2
	];
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set page dimensions & pasteboard');

progressBar.close();
app.select(null);
app.activeWindow.zoom(ZoomOptions.FIT_SPREAD);
