/*
	Fit to page safe area v1.0.0
	© January 2021, Paul Chiorean
	Resizes the selected objects to the page safe area.

	SCOPE: 'page' | 'spread'
	TARGET: null | 'margins' | 'safe area' | 'bleed'
	FORCED_FIT: true | false
*/

// @include "../lib/FitTo.jsxinc";

// We use global variables instead of passing arguments to doScript
var SCOPE = "page";
var TARGET = "safe area";
var FORCED_FIT = false;

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to page safe area"
);
