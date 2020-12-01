/*
	PagesToFiles v1.0.0
	© November 2020, Paul Chiorean
	Saves the pages of the active document in separate files.
*/

if (!(doc = app.activeDocument)) exit();
if (!doc.saved) { alert("Document is not saved."); exit() }
if (doc.spreads.length == 1) { alert("Document has only one spread."); exit() }

var dPath = doc.filePath;
var dName = doc.name.substr(0, doc.name.lastIndexOf("."));
var sufx = GetSuffix();

var set_UIL = app.scriptPreferences.userInteractionLevel;
var count = 0;
for (var i = 0; i < doc.spreads.length; i++) {
	// Filter out current spread
	var r = []; for (var j = 0; j < doc.spreads.length; j++) if (j != i) r.push(j);
	// Disable user interaction and open a copy
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


function GetSuffix() {
	var sufx = prompt("Enter a suffix template in the form '-123':\nThe first character is the separator, the rest are added sequentially to the file names.", "-123", "Enter a suffix");
	if (!sufx) exit();
	if (sufx.length < doc.spreads.length + 1) {
		alert("Not enough characters.\nYou must enter a separator and at least " + doc.spreads.length + " additional characters.", "Enter a suffix");
		GetSuffix();
	}
	if (/[\/\\?%*:|"<>]/g.test(sufx)) {
		alert("You entered an illegal character, please try again.", "Enter a suffix");
		GetSuffix();
	}
	return sufx;
}