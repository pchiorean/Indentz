/*
	Fit to spread stub v1.0.0
	© October 2020, Paul Chiorean
	Resizes the selected objects to the spread size.
*/

try {
	app.doScript(
		File(app.activeScript.path + "/FitTo.jsx"), ScriptLanguage.javascript,
		["spread", null, false], // Arguments: SCOPE, TARGET, FORCED
		UndoModes.FAST_ENTIRE_SCRIPT, "Resize to spread"
	);
} catch (_) {};