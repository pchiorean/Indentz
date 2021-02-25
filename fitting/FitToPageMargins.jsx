/*
	Fit to page margins v1.2.0
	© February 2021, Paul Chiorean
	Resizes the selected objects to the page margins.

	SCOPE: 'page' | 'spread'
	TARGET: 'size' | 'margins' | 'safearea' | 'bleed'
	FORCED_FIT: true | false
*/

// @include "../lib/FitTo.jsxinc";

// We use global variables instead of passing arguments to doScript
var SCOPE = "page";
var TARGET = "margins";
var FORCED_FIT = false;

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to page margins"
);
