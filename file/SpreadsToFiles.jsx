/*
	SpreadsToFiles v1.7.1 (2021-04-15)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Saves the spreads of the active document in separate files.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

if (!(doc = app.activeDocument)) exit();
if (!doc.saved) { alert("Document is not saved."); exit() }
if (doc.spreads.length == 1) { alert("Document has only one spread."); exit() }

var oldUIL = app.scriptPreferences.userInteractionLevel;

var dPath = doc.filePath;
var dName = doc.name.substr(0, doc.name.lastIndexOf("."));
// Default suffix
var defSufx = "-123456789abcdefghijklmnopqrstuvwxyz".substr(0, doc.spreads.length + 1);
var fileSufx = RegExp("[ ._-][a-zA-Z0-9]{" + doc.spreads.length + "}$", "i").exec(dName);
if (/\d\s*x\s*\d/i.test(fileSufx)) fileSufx = null; // Exclude '0x0' suffixes
// Only ask for a suffix if not autodetected
var sufx = fileSufx ? String(fileSufx) : GetSuffix();

var progressBar = new ProgressBar("Saving");
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
	progressBar.update(i+1);
	doc.saveACopy(dFile);
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
	var dCopy = app.open(dFile, false);
	app.scriptPreferences.userInteractionLevel = oldUIL;
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

function ProgressBar(title, width) {
	var pb = new Window("palette", title);
	pb.bar = pb.add("progressbar", undefined, 0, undefined);
	if (!!width) { // Mini progress bar if no width
		pb.msg = pb.add("statictext", undefined, undefined, { truncate: "middle" });
		pb.msg.characters = Math.max(width, 50);
		pb.layout.layout();
		pb.bar.bounds = [ 12, 12, pb.msg.bounds[2], 24 ];
	} else pb.bar.bounds = [ 12, 12, 476, 24 ];
	this.reset = function(max) {
		pb.bar.value = 0;
		pb.bar.maxvalue = max || 0;
		pb.bar.visible = !!max;
		pb.show();
	}
	this.update = function(val, msg) {
		pb.bar.value = val;
		if (!!width) {
			pb.msg.visible = !!msg;
			!!msg && (pb.msg.text = msg);
		}
		pb.text = title + " - " + val + "/" + pb.bar.maxvalue;
		pb.show(); pb.update();
	}
	this.hide = function() { pb.hide() }
	this.close = function() { pb.close() }
}
