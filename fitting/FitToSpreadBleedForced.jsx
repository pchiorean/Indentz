/*
	Fit to spread bleed, forced v1.1.4
	© January 2021, Paul Chiorean
	Resizes the selected objects to the spread bleed size, forced.

	SCOPE: 'page' | 'spread'
	TARGET: null | 'margins' | 'safe area' | 'bleed'
	FORCED_FIT: true | false
*/

// @include "../lib/FitTo.jsxinc";

// We use global variables instead of passing arguments to doScript
var SCOPE = "spread";
var TARGET = "bleed";
var FORCED_FIT = true;

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to spread bleed"
);
