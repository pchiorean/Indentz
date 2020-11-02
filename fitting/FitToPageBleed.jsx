/*
	Fit to page bleed stub v1.1.0
	© November 2020, Paul Chiorean
	Resizes the selected objects to the page bleed size.
*/

//@include "FitTo.jsxinc";

var SCOPE = "page";
var TARGET = "bleed";
var FORCED = false;

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to page bleed"
);
