/*
	Fit to spread safe area v2.0.1
	© March 2021, Paul Chiorean
	Resizes the selected objects to the spread safe area.

	See 'FitTo.jsxinc' for arguments.
*/

// @include "../lib/FitTo.jsxinc";

app.doScript(FitTo, ScriptLanguage.javascript,
	[ "spread", "safearea" ],
	UndoModes.ENTIRE_SCRIPT, "Resize to spread safe area");
