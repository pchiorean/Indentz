/*
	Fit to page safe area v2.0.1
	© March 2021, Paul Chiorean
	Resizes the selected objects to the page safe area.

	See 'FitTo.jsxinc' for arguments.
*/

// @include "../lib/FitTo.jsxinc";

app.doScript(FitTo, ScriptLanguage.javascript,
	[ "page", "safearea" ],
	UndoModes.ENTIRE_SCRIPT, "Resize to page safe area");
