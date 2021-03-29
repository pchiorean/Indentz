/*
	Fit to page bleed v2.0.1
	© March 2021, Paul Chiorean
	Resizes the selected objects to the page bleed size.

	See 'FitTo.jsxinc' for arguments.
*/

// @include "../lib/FitTo.jsxinc";

app.doScript(FitTo, ScriptLanguage.javascript,
	[ "page", "bleed" ],
	UndoModes.ENTIRE_SCRIPT, "Resize to page bleed");
