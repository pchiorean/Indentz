/*
	Spreads to files v1.7.9 (2021-09-21)
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
if (!doc.saved) { alert('Document is not saved.'); exit(); }
if (doc.spreads.length === 1) { alert('Document has only one spread.'); exit(); }

var suffix, spread, inc, targetFile, target;
var r = [];
var ADV = ScriptUI.environment.keyboardState.altKey;
var forbiddenFilenameCharsRE = /[#%^{}\\<>*?\/$!'":@`|=]/g; // eslint-disable-line no-useless-escape
var oldUIL = app.scriptPreferences.userInteractionLevel;
var currentPath = doc.filePath;
var baseName = (/\./g.test(doc.name) && doc.name.slice(0, doc.name.lastIndexOf('.'))) || doc.name;
var progressBar = new ProgressBar('Saving');

// Detect or ask for a suffix
var defaultSufx = '-123456789abcdefghijklmnopqrstuvwxyz'.slice(0, doc.spreads.length + 1);
var detectedSufx = RegExp('[ ._-][a-zA-Z0-9]{' + doc.spreads.length + '}$', 'i').exec(baseName);
if (/\d\s*x\s*\d/i.test(detectedSufx)) detectedSufx = null; // Exclude '0x0' suffixes
if (ADV) suffix = getSuffix(null);
else suffix = detectedSufx ? String(detectedSufx) : getSuffix(null);
// Main loop
progressBar.reset(doc.spreads.length);
for (spread = 0; spread < doc.spreads.length; spread++) {
	// Filter out current spread
	r = [];
	for (var i = 0; i < doc.spreads.length; i++) if (i !== spread) r.push(i);
	// Get unique name
	if (suffix === String(detectedSufx)) baseName = baseName.replace(detectedSufx, '');
	inc = 0;
	do {
		targetFile = File(currentPath + '/' + baseName +              // Base name
			suffix[0] + suffix[spread + 1] +                          // Separator + suffix char
			(inc > 1 ? ' copy ' + inc : (inc === 0 ? '' : ' copy')) + // Unique name
			'.indd');
		inc++;
	} while (targetFile.exists);
	// Disable user interaction and open a copy
	progressBar.update(spread + 1);
	doc.saveACopy(targetFile);
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
	target = app.open(targetFile, false);
	app.scriptPreferences.userInteractionLevel = oldUIL;
	// Remove other spreads from copy and save file
	for (var j = r.length - 1; j >= 0; j--) target.spreads[r[j]].remove();
	target.save(targetFile);
	target.close();
}
progressBar.close();
doc.close(SaveOptions.ASK);


function getSuffix(str) {
	// First recursion
	if (!str) str = detectedSufx || defaultSufx;
	// Ask user
	str = prompt('Enter a suffix template.\nThe first character is the separator, ' +
		'the rest are added sequentially to the file names.', str, 'Enter a suffix');
	if (!str) exit();
	// Sanitize input
	// -- Length
	if (str.length < doc.spreads.length + 1) {
		alert('You must enter a separator and ' + doc.spreads.length + ' additional characters.', 'Enter a suffix');
		getSuffix(str); // Ask again
	}
	// -- Separator
	if (!/[ ._-]/.test(str[0])) {
		alert('Invalid separator, please try again.', 'Enter a suffix');
		getSuffix(str); // Ask again
	}
	// -- Filename
	if (forbiddenFilenameCharsRE.test(str)) {
		alert('You entered a forbidden character, please try again.', 'Enter a suffix');
		getSuffix(str); // Ask again
	}
	return str.slice(0, doc.spreads.length + 1);
}

/**
 * A simple progress bar. Usage:
 * - create: var progress = new ProgressBar(title, ?maxWidth);
 * - init:   progress.reset(maxValue);
 * - update: progress.update(value, ?message);
 * - close:  progress.close();
 * @param {String} title - Palette title (a counter will be appended)
 * @param {Number} maxValue - Number of steps
 * @param {Number} [maxWidth] - Max message length (characters); if ommitted, no message is shown
 * @param {Number} value - Updated value
 * @param {String} message - Message
 */
function ProgressBar(title, maxWidth) {
	var pb = new Window('palette', title);
	pb.bar = pb.add('progressbar');
	if (maxWidth) { // Full progress bar
		pb.msg = pb.add('statictext { properties: { truncate: "middle" } }');
		pb.msg.characters = Math.max(maxWidth, 50);
		pb.layout.layout();
		pb.bar.bounds = [ 12, 12, pb.msg.bounds[2], 24 ];
	} else { // Mini progress bar
		pb.bar.bounds = [ 12, 12, 476, 24 ];
	}
	this.reset = function (maxValue) {
		pb.bar.value = 0;
		pb.bar.maxvalue = maxValue || 0;
		pb.bar.visible = !!maxValue;
		pb.show();
		if (app.windows.length > 0) {
			var AW = app.activeWindow;
			pb.frameLocation = [
				(AW.bounds[1] + AW.bounds[3] - pb.frameSize.width) / 2,
				(AW.bounds[0] + AW.bounds[2] - pb.frameSize.height) / 2
			];
		}
	};
	this.update = function (value, message) {
		pb.bar.value = value;
		if (maxWidth) {
			pb.msg.visible = !!message;
			if (message) pb.msg.text = message;
		}
		pb.text = title + ' \u2013 ' + value + '/' + pb.bar.maxvalue;
		pb.show(); pb.update();
	};
	this.hide = function () { pb.hide(); };
	this.close = function () { pb.close(); };
}
