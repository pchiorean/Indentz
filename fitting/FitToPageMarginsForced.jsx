/*
	Fit to page margins, forced stub v1.0.0
	© October 2020, Paul Chiorean
	Resizes the selected objects to the page margins, forced.
*/

try {
	app.doScript(
		File(app.activeScript.path + "/FitTo.jsx"), ScriptLanguage.javascript,
		["page", "margins", true], // Arguments: SCOPE, TARGET, FORCED
		UndoModes.FAST_ENTIRE_SCRIPT, "Resize to page margins"
	);
} catch (_) {};