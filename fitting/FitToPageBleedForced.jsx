// See 'FitTo.jsxinc' for details.
// @include '../lib/FitTo.jsxinc';

app.doScript(fitTo, ScriptLanguage.JAVASCRIPT,
	[ 'page', 'bleed', true ],
	UndoModes.ENTIRE_SCRIPT, 'Fit to page bleed');
