/*
	Fit to page safe area, forced v2.0.0
	© February 2021, Paul Chiorean
	Resizes the selected objects to the page safe area, forced.

	Arguments are:
	1. SCOPE: 'page' | 'spread' (default 'page')
	2. TARGET: 'size' | 'margins' | 'safearea' | 'bleed' (default 'size')
	3. FORCED_FIT: true | false (default 'false')
*/

// @include "../lib/FitTo.jsxinc";

app.doScript(FitTo, ScriptLanguage.javascript,
	[ "page", "safearea", true ],
	UndoModes.ENTIRE_SCRIPT, "Resize to page safe area");
