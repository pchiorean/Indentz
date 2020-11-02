/*
	Fit to spread stub v1.1.0
	© November 2020, Paul Chiorean
	Resizes the selected objects to the spread size.
*/

//@include "FitTo.jsxinc";

var SCOPE = "spread";
var TARGET = null;
var FORCED = false;

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to spread"
);
