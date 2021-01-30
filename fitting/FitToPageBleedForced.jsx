/*
	Fit to page bleed, forced v1.1.4
	© January 2021, Paul Chiorean
	Resizes the selected objects to the page bleed size, forced.

	SCOPE: 'page' | 'spread'
	TARGET: null | 'margins' | 'safe area' | 'bleed'
	FORCED_FIT: true | false
*/

// @include "../lib/FitTo.jsxinc";

// We use global variables instead of passing arguments to doScript
var SCOPE = "page";
var TARGET = "bleed";
var FORCED_FIT = true;

app.doScript(
	main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Resize to page bleed"
);
