/* eslint-disable max-statements-per-line */

if (!(doc = app.activeDocument)) exit();
var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());

// Set preferences
app.doScript(File(script.path + '/DefaultPrefs.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set preferences');

// Add default swatches
app.doScript(File(script.path + '/DefaultSwatches.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Default swatches');

// Add default layers
app.doScript(File(script.path + '/DefaultLayers.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Default layers');

// Replace fonts
app.doScript(File(script.path + '/ReplaceFonts.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Replace fonts');

doc.textPreferences.showInvisibles = true;

app.doScript(function () {
	// Set page dimensions from filename
	app.doScript(File(script.path + '/PageSizeFromFilename.jsx'),
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
