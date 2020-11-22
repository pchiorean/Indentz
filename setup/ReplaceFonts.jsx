﻿/*
	Replace fonts 1.6.0
	© November 2020, Paul Chiorean
	Replaces fonts from a substitution list. The list is a 4-column TSV file
	with the same name as the script and the following format:

	Old font | Style | New font | Style (header, ignored)
	Arial | Regular | Helvetica Neue | Regular
	Arial | Bold | Helvetica Neue | Bold
	...
*/

// Add ECMA262-5 string trim method
String.prototype.trim = function() { return this.replace(/^\s+/, '').replace(/\s+$/, '') };

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var infoFile = File(app.activeScript.path + "/fonts.txt");
if(!infoFile.exists) infoFile = File(app.activeScript.path + "/../fonts.txt");
if(!infoFile.exists) { alert("File '" + infoFile.name + "' not found."); exit() }

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