/*
	Fit to page margins stub v1.1.0
	© November 2020, Paul Chiorean
	Resizes the selected objects to the page margins.
*/

//@include "FitTo.jsxinc";

var SCOPE = "page";
var TARGET = "margins";
var FORCED = false;

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to page margins"
);
