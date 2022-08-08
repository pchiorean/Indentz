// See 'fitTo.jsxinc' for details.
// @include '../lib/fitTo.jsxinc';

if (!(doc = app.activeDocument)) exit();
if (doc.selection.length === 0 || (doc.selection[0].constructor.name === 'Guide')) exit();

app.doScript("fitTo(doc.selection, 'spread', 'margins', true)",
	ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Fit to spread margins');
