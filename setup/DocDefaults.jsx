/*
	Default layers and more v3.1.1
	© November 2020, Paul Chiorean
	Changes some settings, adds swatches, adds/merges layers,
	cleans up fonts and sets page dimensions from the filename.
*/

if (!(doc = app.activeDocument)) exit();

// Set preferences
app.doScript(File(app.activeScript.path + "/DefPrefs.jsx"), 
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set preferences");

// Add default swatches
app.doScript(File(app.activeScript.path + "/DefSwatches.jsx"), 
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Default swatches");

// Add default layers
app.doScript(File(app.activeScript.path + "/DefLayers.jsx"), 
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Default layers");

// Replace fonts
app.doScript(File(app.activeScript.path + "/ReplaceFonts.jsx"), 
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Replace fonts");

// Sets page dimensions from filename
app.doScript(File(app.activeScript.path + "/PageSizeFromFilename.jsx"), 
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set page dimensions");
