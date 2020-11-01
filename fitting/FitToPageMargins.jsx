/*
	Fit to page margins stub v1.0.0
	© October 2020, Paul Chiorean
	Resizes the selected objects to the page margins.
*/

try {
	app.doScript(
		File(app.activeScript.path + "/FitTo.jsx"), ScriptLanguage.javascript,
		["page", "margins", false], // Arguments: SCOPE, TARGET, FORCED
		UndoModes.FAST_ENTIRE_SCRIPT, "Resize to page margins"
	);
} catch (_) {};