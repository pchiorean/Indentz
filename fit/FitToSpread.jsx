// See 'fitTo.jsxinc' for details.
// @includepath '.;./lib;../lib';
// @include 'fitTo.jsxinc';

if (!(doc = app.activeDocument)) exit();
if (doc.selection.length === 0 || (doc.selection[0].constructor.name === 'Guide')) exit();

app.doScript("fitTo(doc.selection, 'spread', 'size')",
	ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.FAST_ENTIRE_SCRIPT, 'Fit to spread'
);
