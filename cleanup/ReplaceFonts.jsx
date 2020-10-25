/*
	Replace fonts 1.2.0
	© September 2020, Paul Chiorean
	Replaces missing or unwanted fonts with equivalents from a list.
	The list is a TSV file with the same name as the script, with the 
	following format: <Old Name>\t<Style>\t<New Name>\t<Style>
	(the first line is considered header and is ignored).
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var infoFile = File(app.activeScript.path + "/" + app.activeScript.name.replace(/jsx/g, "txt"));
if (!infoFile.open("r")) { alert("File " + infoFile.name + " not found."); exit() };

var fontList = [], line = 0;
while (!infoFile.eof) {
	var infoLine = infoFile.readln().split("\t"); line++;
	if (infoLine[0].toString().slice(0,1) == "\u003B") continue; // Skip ';' commented lines
	if (!infoLine[0] || !infoLine[1] || !infoLine[2] || !infoLine[3]) {
		alert ("Missing data in record " + line + "."); exit();
	}
	fontList.push([
		infoLine[0] + "\t" + infoLine[1],
		infoLine[2] + "\t" + infoLine[3]
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