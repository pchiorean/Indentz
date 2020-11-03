/*
	Fit to spread stub, forced v1.1.1
	© November 2020, Paul Chiorean
	Resizes the selected objects to the spread size, forced.
*/

//@include "FitTo.jsxinc";

// We use global variables instead of passing arguments to doScript
var SCOPE = "spread"; // "page" or "spread"
var TARGET = null; // null or "bleed" or "margins"
var FORCED = true; // false or true

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to spread"
);
