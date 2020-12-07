/*
	Replace fonts 1.8.0
	© December 2020, Paul Chiorean
	Replaces fonts from a 4-column TSV file:

	Old font | Style | New font | Style (header, ignored)
	Arial | Regular | Helvetica Neue | Regular
	Arial | Bold | Helvetica Neue | Bold
	...
*/

// Add ECMA262-5 string trim method
String.prototype.trim = function() { return this.replace(/^\s+/, '').replace(/\s+$/, '') };

if (!(doc = app.activeDocument)) exit();
if (!doc.saved) { alert("Document is not saved."); exit() }

var infoFile = File(app.activeDocument.filePath + "/fonts.txt");
if (!infoFile.exists) infoFile = File(app.activeScript.path + "/fonts.txt");
if (!infoFile.exists) infoFile = File(app.activeScript.path + "/../fonts.txt");
if (!infoFile.exists) { alert("File '" + infoFile.name + "' not found."); exit() }

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Replace fonts");


function main() {
	infoFile.open("r");
	var fontList = [], line = 0;
	while (!infoFile.eof) {
		var infoLine = infoFile.readln().split("\t"); line++;
		if (infoLine[0].toString().slice(0,1) == "\u0023") continue; // Skip lines beginning with '#'
		if (infoLine[0] == "") continue; // Skip empty lines
		if (!infoLine[0] || !infoLine[1] || !infoLine[2] || !infoLine[3]) {
			alert ("Missing data in record " + line + "."); exit();
		}
		fontList.push([
			infoLine[0].trim() + "\t" + infoLine[1].trim(),
			infoLine[2].trim() + "\t" + infoLine[3].trim()
		]);
	}
	infoFile.close();

	for (var i = 1; i < fontList.length; i++) {
		app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
		app.findChangeTextOptions.includeHiddenLayers =
		app.findChangeTextOptions.includeLockedLayersForFind =
		app.findChangeTextOptions.includeLockedStoriesForFind =
		app.findChangeTextOptions.includeMasterPages = true;
		app.findTextPreferences.appliedFont = fontList[i][0];
		app.changeTextPreferences.appliedFont = fontList[i][1];
		app.activeDocument.changeText();
	}
	app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
}