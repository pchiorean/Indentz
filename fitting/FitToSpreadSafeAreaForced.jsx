// See "FitTo.jsxinc" for details.
// @include "../lib/FitTo.jsxinc";

app.doScript(FitTo, ScriptLanguage.javascript,
	[ "spread", "safearea", true ],
	UndoModes.ENTIRE_SCRIPT, "Fit to spread safe area");
