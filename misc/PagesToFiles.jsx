/*
	PagesToFiles v1.1.0
	© December 2020, Paul Chiorean
	Saves the pages of the active document in separate files.
*/

if (!(doc = app.activeDocument)) exit();
if (!doc.saved) { alert("Document is not saved."); exit() }
if (doc.spreads.length == 1) { alert("Document has only one spread."); exit() }

var dPath = doc.filePath;
var dName = doc.name.substr(0, doc.name.lastIndexOf("."));
var defSufx = "-123456789abcdefghijklmnopqrstuvwxyz".substr(0, doc.spreads.length + 1);
var fileSufx = RegExp("[._-][a-zA-Z0-9]{" + doc.spreads.length + "}$", "i").exec(dName);
var sufx = GetSuffix();

var set_UIL = app.scriptPreferences.userInteractionLevel;
var count = 0;
for (var i = 0; i < doc.spreads.length; i++) {
	// Filter out current spread
	var r = []; for (var j = 0; j < doc.spreads.length; j++) if (j != i) r.push(j);
	// Disable user interaction and open a copy
	if (sufx == fileSufx) dName = dName.replace(fileSufx, "");
	var dFile = File(dPath + "/" + dName + sufx[0] + sufx[i + 1] + ".indd");
	doc.saveACopy(dFile);
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
	var dCopy = app.open(dFile, false);
	app.scriptPreferences.userInteractionLevel = set_UIL;
	// Remove other spreads from copy
	for (var j = r.length - 1; j >= 0; j--) dCopy.spreads[r[j]].remove();
	dCopy.save(dFile); dCopy.close();
	count++;
}
// alert("Saved " + count + (count > 1 ? " files." : " file."));


function GetSuffix(sufx) {
	if (sufx == undefined) sufx = fileSufx != null ? fileSufx : defSufx;
	sufx = prompt("Enter a suffix template.\nThe first character is the separator, "
		+ "the rest are added sequentially to the file names.", sufx, "Enter a suffix");
	if (!sufx) exit();
	if (sufx.length != doc.spreads.length + 1) {
		alert("You must enter a separator and " + doc.spreads.length
		+ " additional characters.", "Enter a suffix");
		GetSuffix(sufx);
	}
	if (!/[ ._-]/.test(sufx[0])) {
		alert("Invalid separator, please try again.", "Enter a suffix");
		GetSuffix(sufx);
	}
	if (/[\/\\?%*:|"<>]/.test(sufx)) {
		alert("You entered an illegal character, please try again.", "Enter a suffix");
		GetSuffix(sufx);
	}
	return sufx;
}