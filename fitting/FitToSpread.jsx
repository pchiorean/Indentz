/*
	Fit to spread v2.0.0
	© February 2021, Paul Chiorean
	Resizes the selected objects to the spread size.

	Arguments are:
	1. SCOPE: 'page' | 'spread' (default 'page')
	2. TARGET: 'size' | 'margins' | 'safearea' | 'bleed' (default 'size')
	3. FORCED_FIT: true | false (default 'false')
*/

// @include "../lib/FitTo.jsxinc";

app.doScript(FitTo, ScriptLanguage.javascript,
	[ "spread", "size" ],
	UndoModes.ENTIRE_SCRIPT, "Resize to spread");
