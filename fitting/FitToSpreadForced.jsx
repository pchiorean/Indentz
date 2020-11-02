/*
	Fit to spread stub, forced v1.1.0
	© November 2020, Paul Chiorean
	Resizes the selected objects to the spread size, forced.
*/

//@include "FitTo.jsxinc";

var SCOPE = "spread";
var TARGET = null;
var FORCED = true;

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to spread"
);
