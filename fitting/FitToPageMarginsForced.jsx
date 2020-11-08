/*
	Fit to page margins, forced stub v1.1.2
	© November 2020, Paul Chiorean
	Resizes the selected objects to the page margins, forced.
*/

//@include "../lib/FitTo.jsxinc";

// We use global variables instead of passing arguments to doScript
var SCOPE = "page"; // "page" or "spread"
var TARGET = "margins"; // null or "bleed" or "margins"
var FORCED = true; // false or true

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to page margins"
);
