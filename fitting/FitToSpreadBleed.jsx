/*
	Fit to spread bleed v2.0.1
	© March 2021, Paul Chiorean
	Resizes the selected objects to the spread bleed size.

	See 'FitTo.jsxinc' for arguments.
*/

// @include "../lib/FitTo.jsxinc";

app.doScript(FitTo, ScriptLanguage.javascript,
	[ "spread", "bleed", false ],
	UndoModes.ENTIRE_SCRIPT, "Resize to spread bleed");
