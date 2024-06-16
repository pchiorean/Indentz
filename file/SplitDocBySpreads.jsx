/*
	Split document by spreads 24.6.16
	(c) 2020-2024 Paul Chiorean <jpeg@basement.ro>

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

// @includepath '.;./lib;../lib';
// @include 'progressBar.jsxinc';

if (!(doc = app.activeDocument)) exit();
if (!doc.saved) { alert('Document is not saved.'); exit(); }
if (doc.spreads.length === 1) { alert('Document has only one spread.'); exit(); }

var defaultTemplate, detectedTemplate, template, customPosition, spread, targetFile, target, progressBar, i, j;
var r = [];
var ADV = ScriptUI.environment.keyboardState.altKey;
var invalidFilenameCharsRE = /[<>:"\/\\|?*]/g; // https://gist.github.com/doctaphred/d01d05291546186941e1b7ddc02034d3
var oldUIL = app.scriptPreferences.userInteractionLevel;
var currentPath = doc.filePath;
var baseName = (/\./g.test(doc.name) && doc.name.slice(0, doc.name.lastIndexOf('.'))) || doc.name;

// Detect or ask user for a template
defaultTemplate = '-123456789abcdefghijklmnopqrstuvwxyz'.slice(0, doc.spreads.length + 1);
detectedTemplate = RegExp('[ ._-][a-zA-Z0-9]{' + doc.spreads.length + '}$', 'i').exec(baseName);
if (/\d\s*x\s*\d/i.test(detectedTemplate)) detectedTemplate = null; // Exclude '0x0' suffixes
if (ADV) template = templateFromUser(null); // In advanced mode always ask user
else template = detectedTemplate ? String(detectedTemplate) : templateFromUser(null);
if (template === String(detectedTemplate)) baseName = baseName.replace(detectedTemplate, '');

// Detect custom position placeholder
customPosition = baseName.match(/(.+?)#(.+)/);

progressBar = new ProgressBar('Saving', doc.spreads.length);
for (spread = 0; spread < doc.spreads.length; spread++) {
	// Filter out current spread
	r = [];
	for (i = 0; i < doc.spreads.length; i++) if (i !== spread) r.push(i);

	// Get unique name
	targetFile = File(currentPath + '/'
		+ uniqueName(customPosition
			? (customPosition[1] + template[spread + 1] + customPosition[2]) // Custom position
			: (baseName + template[0] + template[spread + 1]) // Default position
		) + '.indd');

	// Disable user interaction and open a copy
	progressBar.update();
	doc.saveACopy(targetFile);
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
	target = app.open(targetFile, false);
	app.scriptPreferences.userInteractionLevel = oldUIL;

	// Remove other spreads from copy and save file
	for (j = r.length - 1; j >= 0; j--) target.spreads[r[j]].remove();
	target.save(targetFile);
	target.close();
}
progressBar.close();
doc.close(SaveOptions.ASK);

function templateFromUser(str) {
	if (!str) str = detectedTemplate || defaultTemplate;
	str = prompt('Please enter an index list.\nThe first character is the separator, the rest will be '
		+ 'added sequentially to each file name; for example \'-123\' will split a 3-spreads document into\n\n'
		+ 'Document-1.indd\nDocument-2.indd\nDocument-3.indd\n\nIf the file name contains a "#", the index '
		+ 'will be placed in that position (the separator is ignored).', str);
	if (!str) exit();

	// Sanitize input
	// -- Length
	if (str.length < doc.spreads.length + 1) {
		alert('You must enter a separator and ' + doc.spreads.length + ' additional characters.');
		templateFromUser(str);
	}
	// -- Separator
	if (!/[ ._\-~]/.test(str[0])) {
		alert('You entered an invalid separator, please try again.\nUse only space, period, '
			+ 'underscore, hyphen or tilde.');
		templateFromUser(str);
	}
	// -- Filename
	if (invalidFilenameCharsRE.test(str)) {
		alert('You entered an invalid character, please try again.\nAvoid < > : " / \\ | ? and *.');
		templateFromUser(str);
	}
	return str.slice(0, doc.spreads.length + 1);
}

function uniqueName(str) {
	var name;
	var i = 0;
	do {
		name = str + (i === 0 ? '' : (' copy' + (i === 1 ? '' : ' ' + i)));
		i++;
	} while (File(currentPath + '/' + name + '.indd').exists);
	return name;
}
