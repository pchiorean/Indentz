/*
	Fit to spread bleed, forced stub v1.0.0
	© October 2020, Paul Chiorean
	Resizes the selected objects to the spread bleed size, forced.
*/

try {
	app.doScript(
		File(app.activeScript.path + "/FitTo.jsx"), ScriptLanguage.javascript,
		["spread", "bleed", true], // Arguments: SCOPE, TARGET, FORCED
		UndoModes.FAST_ENTIRE_SCRIPT, "Resize to spread bleed"
	);
} catch (_) {};