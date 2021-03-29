/*
	Fit to spread margins v2.0.1
	© March 2021, Paul Chiorean
	Resizes the selected objects to the spread margins.

	See 'FitTo.jsxinc' for arguments.
*/

// @include "../lib/FitTo.jsxinc";

app.doScript(FitTo, ScriptLanguage.javascript,
	[ "spread", "margins" ],
	UndoModes.ENTIRE_SCRIPT, "Resize to spread margins");
