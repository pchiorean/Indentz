// See "FitTo.jsxinc" for details.
// @include "../lib/FitTo.jsxinc";

app.doScript(FitTo, ScriptLanguage.javascript,
	[ "page", "safearea", true ],
	UndoModes.ENTIRE_SCRIPT, "Fit to page safe area");
