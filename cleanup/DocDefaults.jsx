/*
	Document defaults 22.3.11
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

	Sets default layers/swatches/links/fonts and sets page dimensions from the filename.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @include '../lib/ProgressBar.jsxinc';

var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());
var progressBar = new ProgressBar('Set document defaults', 7);

progressBar.update(1, 'Set preferences');
app.doScript(File(script.path + '/DefaultPrefs.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set preferences');

progressBar.update(2, 'Set default layers');
app.doScript(File(script.path + '/DefaultLayers.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Default layers');

progressBar.update(3, 'Set default swatches');
app.doScript(File(script.path + '/DefaultSwatches.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Default swatches');

progressBar.update(4, 'Replace links');
app.doScript(File(script.path + '/ReplaceLinks.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Replace links');

progressBar.update(5, 'Replace fonts');
app.doScript(File(script.path + '/ReplaceFonts.jsx'),
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Replace fonts');

progressBar.update(6, 'Show invisibles');
doc.textPreferences.showInvisibles = true;

progressBar.update(7, 'Set page/pasteboard size');
app.doScript(function () {
	app.doScript(File(script.path + '/../layout/PageSizeFromFilename.jsx'),
	ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Set page dimensions');
	doc.pasteboardPreferences.pasteboardMargins = [
		doc.pages[0].bounds[3] - doc.pages[0].bounds[1],
		(doc.pages[0].bounds[2] - doc.pages[0].bounds[0]) / 3
	];
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set page/pasteboard size');

progressBar.close();
// app.select(null);
// app.activeWindow.zoom(ZoomOptions.FIT_SPREAD);
