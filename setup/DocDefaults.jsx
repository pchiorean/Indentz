if (!(doc = app.activeDocument)) exit();

// Set preferences
app.doScript(File(app.activeScript.path + "/DefaultPrefs.jsx"),
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set preferences");

// Add default swatches
app.doScript(File(app.activeScript.path + "/DefaultSwatches.jsx"),
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Default swatches");

// Add default layers
app.doScript(File(app.activeScript.path + "/DefaultLayers.jsx"),
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Default layers");

// Replace fonts
app.doScript(File(app.activeScript.path + "/ReplaceFonts.jsx"),
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Replace fonts");

// Set page dimensions from filename
app.doScript(File(app.activeScript.path + "/PageSizeFromFilename.jsx"),
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set page dimensions");

// Set pasteboard
app.doScript(function() { doc.pasteboardPreferences.pasteboardMargins = ["150mm", "25mm"] },
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set pasteboard");

// Run finishing script
if (doc.saved) {
	var script = File(doc.filePath + "/_finish.jsx");
	if (script.exists && confirm("Run local finishing script?"))
		app.doScript(script,
		ScriptLanguage.javascript, undefined,
		UndoModes.ENTIRE_SCRIPT, "Finishing script");
}
