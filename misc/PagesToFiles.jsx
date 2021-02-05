/*
	PagesToFiles v1.5.1
	© February 2021, Paul Chiorean
	Saves the pages of the active document in separate files.
*/

if (!(doc = app.activeDocument)) exit();
if (!doc.saved) { alert("Document is not saved."); exit() }
if (doc.spreads.length == 1) { alert("Document has only one spread."); exit() }

var set_UIL = app.scriptPreferences.userInteractionLevel;

var dPath = doc.filePath;
var dName = doc.name.substr(0, doc.name.lastIndexOf("."));
// Default suffix
var defSufx = "-123456789abcdefghijklmnopqrstuvwxyz".substr(0, doc.spreads.length + 1);
var fileSufx = RegExp("[ ._-][a-zA-Z0-9]{" + doc.spreads.length + "}$", "i").exec(dName);
if (/\d\s*x\s*\d/i.test(fileSufx)) fileSufx = null; // Exclude '0x0' suffixes
// Only ask for a suffix if not autodetected
var sufx = fileSufx ? String(fileSufx) : GetSuffix();

var progressBar = new ProgressBar(dName.length + 12);
progressBar.reset(doc.spreads.length);
for (var i = 0; i < doc.spreads.length; i++) {
	// Filter out current spread
	for (var r = [], j = 0; j < doc.spreads.length; j++) if (j != i) r.push(j);
	// Disable user interaction and open a copy
	if (sufx == fileSufx) dName = dName.replace(fileSufx, "");
	var inc = 0;
	do { var dFile = File(dPath + "/" + dName + sufx[0] + sufx[i + 1]
		+ (inc > 1 ? " copy " + inc : (inc == 0 ? "" : " copy"))
		+ ".indd");
		inc++;
	} while (dFile.exists);
	progressBar.update(i + 1, dFile.name);
	doc.saveACopy(dFile);
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
	var dCopy = app.open(dFile, false);
	app.scriptPreferences.userInteractionLevel = set_UIL;
	// Remove other spreads from copy
	for (var j = r.length - 1; j >= 0; j--) dCopy.spreads[r[j]].remove();
	dCopy.save(dFile); dCopy.close();
}
progressBar.close();
doc.close();


function GetSuffix(sufx) {
	// First recursion
	if (sufx == undefined) sufx = fileSufx != null ? fileSufx : defSufx;
	// Ask user
	sufx = prompt("Enter a suffix template.\nThe first character is the separator, "
		+ "the rest are added sequentially to the file names.", sufx, "Enter a suffix");
	if (!sufx) exit();
	// Sanitize input
	if (sufx.length != doc.spreads.length + 1) { // Length
		alert("You must enter a separator and " + doc.spreads.length
		+ " additional characters.", "Enter a suffix");
		GetSuffix(sufx); // Ask again
	}
	if (!/[ ._-]/.test(sufx[0])) { // Separator
		alert("Invalid separator, please try again.", "Enter a suffix");
		GetSuffix(sufx); // Ask again
	}
	if (/[\/\\?%*:|"<>]/.test(sufx)) { // Filename
		alert("You entered an illegal character, please try again.", "Enter a suffix");
		GetSuffix(sufx); // Ask again
	}
	return sufx;
}

function ProgressBar(width) {
	width = Math.max(width, 50);
	var w = new Window("palette", "Pages to Files");
	w.pb = w.add("progressbar", [12, 12, ((width + 20) * 6.5), 24], 0, undefined);
	w.st = w.add("statictext", [0, 0, ((width + 20) * 6.5 - 20), 20], undefined, { truncate: "middle" });
	this.reset = function(max) {
		w.pb.value = 0;
		w.pb.maxvalue = max || 0;
		w.pb.visible = !!max;
		w.show();
	}
	this.update = function(val, file) {
		w.pb.value = val;
		w.st.text = "Saving: " + decodeURI(file) + " (" + val + " of " + w.pb.maxvalue + ")";
		w.show(); w.update();
	}
	this.hide = function() { w.hide() }
	this.close = function() { w.close() }
}
