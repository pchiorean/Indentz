/*
	Replace fonts 2.1.8 (2021-09-30)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Replaces fonts from a 4-column TSV file named 'fonts.txt':

	Old font | Style   | New font       | Style
	Arial    | Regular | Helvetica Neue | Regular
	Arial    | Bold    | Helvetica Neue | Bold
	...

	The file can be saved in the current folder, on the desktop, or next to the script.
	Blank lines and those prefixed with '#' are ignored; includes records from '@path/to/include.txt'.

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

// @include '../lib/GetDataFile.jsxinc';
// @include '../lib/Report.jsxinc';

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Replace fonts');

function main() {
	var file, data;
	if (!(file = getDataFile('fonts.txt'))) { alert('No data file found.'); exit(); }
	data = parseDataFile(file);
	if (data.errors.length > 0) { report(data.errors, decodeURI(file.getRelativeURI(doc.filePath))); exit(); }
	if (data.records.length === 0) exit();

	for (var i = 0, n = data.records.length; i < n; i++) {
		app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
		app.findChangeTextOptions.includeHiddenLayers         = true;
		app.findChangeTextOptions.includeLockedLayersForFind  = true;
		app.findChangeTextOptions.includeLockedStoriesForFind = true;
		app.findChangeTextOptions.includeMasterPages          = true;
		app.findTextPreferences.appliedFont                   = data.records[i][0];
		app.changeTextPreferences.appliedFont                 = data.records[i][1];
		doc.changeText();
	}
	app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;

	/**
	 * Reads a TSV (tab-separated-values) file, returning an object containing found records and errors.
	 * Blank lines and those prefixed with `#` are ignored. Includes records from `@path/to/include.txt`
	 * or `@default` data file (see `getDataFile()`).
	 * @param {File} dataFile - A tab-separated-values file (object).
	 * @param {boolean} flgR - Flag for recursive call (`@include`).
	 * @returns {{records: array, errors: array}}
	 */
	function parseDataFile(dataFile, flgR) {
		var infoLine, include, includeFile;
		var buffer = [];
		var records = [];
		var errors = [];
		var flgHeader = false;
		var line = 0;
		dataFile.open('r');
		while (!dataFile.eof) {
			infoLine = dataFile.readln(); line++;
			if (infoLine.replace(/^\s+|\s+$/g, '') === '') continue; // Ignore blank lines
			if (infoLine.slice(0,1) === '\u0023') continue;          // Ignore lines prefixed with '#'
			infoLine = infoLine.split(/ *\t */);
			if (!flgHeader) { flgHeader = true; continue; } // Header
			// '@include'
			if (infoLine[0].slice(0,1) === '\u0040') { // '@'
				include = infoLine[0].slice(1).replace(/^\s+|\s+$/g, '').replace(/^['"]+|['"]+$/g, '');
				includeFile = /^default(s?)$/i.test(include) ?                      // '@default' ?
					getDataFile(decodeURI(dataFile.name).replace(/^_/, ''), true) : // Include default data file :
					File(include);                                                  // Include 'path/to/file.txt'
				if (includeFile && includeFile.exists) {
					if (includeFile.fullName === dataFile.fullName) continue;       // Skip self
					buffer = parseDataFile(includeFile, true);
					records = records.concat(buffer.records);
					errors = errors.concat(buffer.errors);
				}
			} else { validateRecord(); }
		}
		dataFile.close(); infoLine = '';
		return { records: records, errors: errors };

		function validateRecord() {
			if (!infoLine[0] || !infoLine[2]) {
				errors.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line +
				': Missing font name.');
			}
			if (!infoLine[1] || !infoLine[3]) {
				errors.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line +
				': Missing font style.');
			}
			if (app.fonts.item(infoLine[2] + '\t' + infoLine[3]).status !== FontStatus.INSTALLED) {
				errors.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line +
				': Font \'' + (infoLine[2] + ' ' + infoLine[3]).replace(/\t/g, ' ') + '\' is not installed.');
			}
			if (errors.length === 0) {
				records.push([
					infoLine[0] + '\t' + infoLine[1],
					infoLine[2] + '\t' + infoLine[3]
				]);
			}
		}
	}
}
