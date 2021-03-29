/*
	Fit to spread v2.0.1
	© March 2021, Paul Chiorean
	Resizes the selected objects to the spread size.

	See 'FitTo.jsxinc' for arguments.
*/

// @include "../lib/FitTo.jsxinc";

app.doScript(FitTo, ScriptLanguage.javascript,
	[ "spread", "size" ],
	UndoModes.ENTIRE_SCRIPT, "Resize to spread");
