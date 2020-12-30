/*
	Fit to page margins stub v1.1.3
	© December 2020, Paul Chiorean
	Resizes the selected objects to the page margins.
*/

// @include "../lib/FitTo.jsxinc";

// We use global variables instead of passing arguments to doScript
var SCOPE = "page"; // "page" | "spread"
var TARGET = "margins"; // null | "bleed" | "margins"
var FORCED_FIT = false; // false | true

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to page margins"
);
