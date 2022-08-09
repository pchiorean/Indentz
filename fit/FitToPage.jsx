// See 'fitTo.jsxinc' for details.
// @includepath '.;./lib;../lib';
// @include 'fitTo.jsxinc';

if (!(doc = app.activeDocument)) exit();
if (doc.selection.length === 0 || (doc.selection[0].constructor.name === 'Guide')) exit();

app.doScript("fitTo(doc.selection, 'page', 'size')",
	ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Fit to page');
