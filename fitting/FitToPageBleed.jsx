/*
	Fit to page bleed stub v1.1.2
	© November 2020, Paul Chiorean
	Resizes the selected objects to the page bleed size.
*/

//@include "../lib/FitTo.jsxinc";

// We use global variables instead of passing arguments to doScript
var SCOPE = "page"; // "page" or "spread"
var TARGET = "bleed"; // null or "bleed" or "margins"
var FORCED = false; // false or true

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to page bleed"
);
