/*
	Reset layers state 24.2.10
	(c) 2020-2024 Paul Chiorean <jpeg@basement.ro>

	Resets the visible/printable/locked state of layers using a TSV file named `layers.tsv`:

	Name       | ... | Visible | Printable | Locked | ...
	dielines   |     | yes     | yes       | yes    |
	bg         |     |         |           |        |
	.reference |     | no      | no        |        |
	...

	<Name>: layer name;
	<Visible>: `yes` or `no` (defaults to `yes`);
	<Printable>: `yes` or `no` (defaults to `yes`);
	<Locked>: `yes` or `no` (defaults to `no`).
	Other columns are ignored.

	The TSV file must be saved locally (in the active document folder or its parent) or as a global
	default (on the desktop, next to the script, or in Indentz root); local files and those starting
	with `_` take precedence. Blank lines are ignored; everything after a `#` (comments) is ignored.
	A line ending in `\` continues on the next line. Use `@defaults` to include the global default,
	or `@include path/to/another.tsv` for other data file. The path can be absolute, or by default
	relative to the data file; a new default path can be set with `@includepath path/to/`.

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

// @includepath '.;./lib;../lib';
// @include 'parseDataFile.jsxinc';
// @include 'report.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Reset layers state');

function main() {
	var title = 'Resetting layers state';
	var dataFileName = [ 'layers.tsv', 'layers.txt' ];
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: only errors, 1: + warnings, 2: + infos
	var file, messages, i, rec, targetLayer;
	var parsed = { header: [], data: [], errors: [] };
	var data = { records: [], status: { info: [], warn: [], error: [] } };
	var counter = 0;
	var docHasPath = (function () {
		var ret = false;
		try { ret = !!doc.filePath; } catch (e) {}
		return ret;
	}());

	if (!docHasPath && VERBOSITY > 1)
		alert('Can\'t get document path.\nThe default layer substitution list will be used.');

	// Get raw data from TSV
	if (!(file = getDataFile(dataFileName))) { // No data file found
		if (VERBOSITY > 1) {
			alert('Can\'t locate a substitution list \''
				+ (dataFileName.constructor.name === 'Array' ? dataFileName.join('\' or \'') : dataFileName)
				+ '\'.\nThe file must be saved in the current folder, on the desktop, or next to the script. '
				+ 'Check docs for details.');
		}
		exit();
	}
	parsed = parseDataFile(file, dataFileName);
	if (parsed.errors.length > 0) { report(parsed.errors, title); exit(); }

	// Build structured data
	for (i = 0; i < parsed.data.length; i++)
		data.records[i] = checkRecord(parsed.data[i].record);
	if (data.status.error.length > 0) { report(data.status.error, title); exit(); }

	// Processing
	for (i = data.records.length - 1; i >= 0; i--) {
		rec = data.records[i];
		targetLayer = targetLayer = doc.layers.item(rec.name);
		if (targetLayer.isValid) {
			targetLayer.properties = {
				visible:    rec.isVisible,
				printable:  rec.isPrintable,
				locked:     rec.isLocked
			};
			counter++;
			stat(data.status, rec.source, 'Changed \'' + targetLayer.name + '\' to '
				+ (rec.isVisible ?   '' : 'not ') + 'visible | '
				+ (rec.isPrintable ? '' : 'not ') + 'printable | '
				+ (rec.isLocked ?    '' : 'not ') + 'locked'
				+ '.', 0
			);
		}
	}

	// Closing up
	if (VERBOSITY > 0) {
		messages = data.status.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.status.info);
		if (messages.length > 0)
			report(messages, 'Layers: ' + counter + ' changed', 'auto');
		else if (VERBOSITY > 1 && counter === 0) alert('No layers changed.');
	}

	function checkRecord(/*array*/record) {
		var tmpData = {};

		tmpData.source = parsed.data[i].source.join(':');
		tmpData.name = record[0];
		tmpData.isVisible = record[2] ? (record[2].toLowerCase() === 'yes') : true;
		tmpData.isPrintable = record[3] ? (record[3].toLowerCase() === 'yes') : true;
		tmpData.isLocked = record[4] ? (record[4].toLowerCase() === 'yes') : false;

		if (tmpData.name.length === 0) stat(data.status, tmpData.source + ':1', 'Missing layer name.', -1);

		if (data.status.error.length > 0) return false;
		return tmpData;
	}
}
