/*
	Fit to spread bleed, forced stub v1.1.0
	© November 2020, Paul Chiorean
	Resizes the selected objects to the spread bleed size, forced.
*/

//@include "FitTo.jsxinc";

var SCOPE = "spread";
var TARGET = "bleed";
var FORCED = true;

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to spread bleed"
);
