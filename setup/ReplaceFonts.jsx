/*
	Replace fonts 1.12.0
	© January 2021, Paul Chiorean
	Replaces fonts from a 4-column TSV file:

	Old font | Style | New font | Style
	Arial | Regular | Helvetica Neue | Regular
	Arial | Bold | Helvetica Neue | Bold
	...
*/

// Add ECMA262-5 string trim method
String.prototype.trim = function() { return this.replace(/^\s+/, '').replace(/\s+$/, '') };

if (!(doc = app.activeDocument)) exit();
if (!(infoFile = TSVFile("fonts.txt"))) { alert("File 'fonts.txt' not found."); exit() }

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Replace fonts");


function main() {
	infoFile.open("r");
	var infoLine, header, data = [],
		line = 0, flg_H = false,
		errors = [], errln, errfn = infoFile.fullName + "\n";
	while (!infoFile.eof) {
		infoLine = infoFile.readln(); line++;
		if (infoLine == "") continue; // Skip empty lines
		if (infoLine.toString().slice(0,1) == "\u0023") continue; // Skip lines beginning with '#'
		infoLine = infoLine.split("\t");
		if (!flg_H) { header = infoLine; flg_H = true; continue } // 1st line is header
		errln = "Line " + line + ": ";
		if (!infoLine[0] || !infoLine[2]) errors.push(errln + "Missing font name.");
		if (!infoLine[1] || !infoLine[3]) errors.push(errln + "Missing font style.");
		if (errors.length == 0) data.push([
			infoLine[0].trim() + "\t" + infoLine[1].trim(),
			infoLine[2].trim() + "\t" + infoLine[3].trim()
		]);
	}
	infoFile.close(); infoLine = "";
	if (errors.length > 0) { alert(errfn + errors.join("\n")); exit() }
	if (data.length < 1) exit();

	for (var i = 0; i < data.length; i++) {
		app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
		app.findChangeTextOptions.includeHiddenLayers = true;
		app.findChangeTextOptions.includeLockedLayersForFind = true;
		app.findChangeTextOptions.includeLockedStoriesForFind = true;
		app.findChangeTextOptions.includeMasterPages = true;
		app.findTextPreferences.appliedFont = data[i][0];
		app.changeTextPreferences.appliedFont = data[i][1];
		doc.changeText();
	}
	app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
}

function TSVFile(fn) {
	var file = "";
	if (doc.saved && (file = File(app.activeDocument.filePath + "/_" + fn)) && file.exists) return file;
	if (doc.saved && (file = File(app.activeDocument.filePath + "/" + fn)) && file.exists) return file;
	if ((file = File(Folder.desktop + "/" + fn)) && file.exists) return file;
	if ((file = File(app.activeScript.path + "/" + fn)) && file.exists) return file;
	if ((file = File(app.activeScript.path + "/../" + fn)) && file.exists) return file;
}
