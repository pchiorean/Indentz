/*
	Fit to spread margins, forced stub v1.0.0
	© October 2020, Paul Chiorean
	Resizes the selected objects to the spread margins, forced.
*/

try {
	app.doScript(
		File(app.activeScript.path + "/FitTo.jsx"), ScriptLanguage.javascript,
		["spread", "margins", true], // Arguments: SCOPE, TARGET, FORCED
		UndoModes.FAST_ENTIRE_SCRIPT, "Resize to spread margins"
	);
} catch (_) {};