/*
	Fit to page stub v1.1.0
	© November 2020, Paul Chiorean
	Resizes the selected objects to the page size.
*/

//@include "FitTo.jsxinc";

var SCOPE = "page";
var TARGET = null;
var FORCED = false;

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to page"
);
