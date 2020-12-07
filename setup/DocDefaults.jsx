/*
	Default layers and more v3.2.0
	© December 2020, Paul Chiorean
	Changes some settings, adds swatches, adds/merges layers,
	cleans up fonts and sets page dimensions from the filename.
*/

if (!(doc = app.activeDocument)) exit();
if (!doc.saved) { alert("Document is not saved."); exit() }

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

// Sets page dimensions from filename
app.doScript(File(app.activeScript.path + "/PageSizeFromFilename.jsx"), 
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set page dimensions");
