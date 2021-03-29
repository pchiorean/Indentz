/*
	Fit to page v2.0.1
	© March 2021, Paul Chiorean
	Resizes the selected objects to the page size.

	See 'FitTo.jsxinc' for arguments.
*/

// @include "../lib/FitTo.jsxinc";

app.doScript(FitTo, ScriptLanguage.javascript,
	[ "page", "size" ],
	UndoModes.ENTIRE_SCRIPT, "Resize to page");
