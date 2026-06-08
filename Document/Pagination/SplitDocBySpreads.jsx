/*
	Split document by spreads 26.6.8
	(c) 2020-2026 Paul Chiorean <jpeg@basement.ro>

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

// @includepath '.;./lib;../lib;../../lib';
// @include 'progressBar.jsxinc';

if (!(doc = app.activeDocument)) exit();
if (!doc.saved) { alert('Document is not saved.'); exit(); }
if (doc.spreads.length === 1) { alert('Document has only one spread.'); exit(); }

var customPosition, progressBar, spread, target, targetFile, i, j;
var r = [];
var oldUIL = app.scriptPreferences.userInteractionLevel;
var currentPath = doc.filePath;
var baseName = (/\./g.test(doc.name) && doc.name.slice(0, doc.name.lastIndexOf('.'))) || doc.name;

// Detect custom position placeholder
customPosition = baseName.match(/(.+?)#(.+)/);

if (doc.spreads.length > 3) progressBar = new ProgressBar('Saving', doc.spreads.length);
for (spread = 0; spread < doc.spreads.length; spread++) {
	// Filter out current spread
	r = [];
	for (i = 0; i < doc.spreads.length; i++) if (i !== spread) r.push(i);

	// Get unique name
	targetFile = File(currentPath + '/'
		+ uniqueName(customPosition
			? (customPosition[1] + (spread + 1) + customPosition[2]) // Custom position
			: (baseName + '-' + (spread + 1)) // Default position
		) + '.indd');

	// Disable user interaction and open a copy
	if (progressBar) progressBar.update();
	doc.saveACopy(targetFile);
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
	target = app.open(targetFile, false);
	app.scriptPreferences.userInteractionLevel = oldUIL;

	// Remove other spreads from copy and save file
	for (j = r.length - 1; j >= 0; j--) target.spreads[r[j]].remove();
	target.save(targetFile);
	target.close();
}
if (progressBar) progressBar.close();
doc.close(SaveOptions.ASK);

function uniqueName(str) {
	var name;
	var i = 0;
	do {
		name = str + (i === 0 ? '' : (' copy' + (i === 1 ? '' : ' ' + i)));
		i++;
	} while (File(currentPath + '/' + name + '.indd').exists);
	return name;
}
