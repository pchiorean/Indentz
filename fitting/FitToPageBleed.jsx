/*
	Fit to page bleed stub v1.0.0
	© October 2020, Paul Chiorean
	Resizes the selected objects to the page bleed size.
*/

try {
	app.doScript(
		File(app.activeScript.path + "/FitTo.jsx"), ScriptLanguage.javascript,
		["page", "bleed", false], // Arguments: SCOPE, TARGET, FORCED
		UndoModes.FAST_ENTIRE_SCRIPT, "Resize to page bleed"
	);
} catch (_) {};