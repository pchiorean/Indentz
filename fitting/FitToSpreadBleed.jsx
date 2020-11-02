/*
	Fit to spread bleed stub v1.1.0
	© November 2020, Paul Chiorean
	Resizes the selected objects to the spread bleed size.
*/

//@include "FitTo.jsxinc";

var SCOPE = "spread";
var TARGET = "bleed";
var FORCED = false;

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to spread bleed"
);
