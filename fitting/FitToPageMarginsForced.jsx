/*
	Fit to page margins, forced stub v1.1.0
	© November 2020, Paul Chiorean
	Resizes the selected objects to the page margins, forced.
*/

//@include "FitTo.jsxinc";

var SCOPE = "page";
var TARGET = "margins";
var FORCED = true;

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to page margins"
);
