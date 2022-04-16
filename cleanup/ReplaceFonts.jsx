/*
	Replace fonts 22.4.16
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

	Replaces fonts from a 4-column TSV file named 'fonts.txt':

	Old font | Style   | New font       | Style
	Arial    | Regular | Helvetica Neue | Regular
	Arial    | Bold    | Helvetica Neue | Bold
	...

	The file can be saved in the current folder, on the desktop, or next to the script.
	Blank lines and those prefixed with `#` are ignored. A line ending in `\` continues on the next line.
	Include records from another file with `@path/to/include.txt` or the `@default` data file.

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
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, data, messages, i, n;
	var counter = 0;
	if (doc.converted && VERBOSITY > 0) {
		alert('Can\'t get document path.\nThe document was converted from a previous InDesign version. ' +
		'The default font substitution list will be used.');
	}
	if (!(file = getDataFile('fonts.txt'))) {
		if (VERBOSITY > 1) {
			alert('Can\'t locate a font substitution list.\nThe file must be saved in the current folder, ' +
			'on the desktop, or next to the script. Check docs for details.');
		}
		exit();
	}
	data = parseDataFile(file);
	if (data.errors.fail.length > 0) { report(data.errors.fail, decodeURI(file.getRelativeURI(doc.filePath))); exit(); }
	if (data.records.length > 0) {
		for (i = 0, n = data.records.length; i < n; i++) {
			app.findTextPreferences = app.changeTextPreferences   = NothingEnum.NOTHING;
			app.findChangeTextOptions.includeHiddenLayers         = true;
			app.findChangeTextOptions.includeLockedLayersForFind  = true;
			app.findChangeTextOptions.includeLockedStoriesForFind = true;
			app.findChangeTextOptions.includeMasterPages          = true;
			app.findTextPreferences.appliedFont                   = data.records[i][0];
			app.changeTextPreferences.appliedFont                 = data.records[i][1];
			if (doc.changeText().length > 0) {
				counter++;
				data.errors.info.push('Replaced \'' +
					data.records[i][0].replace('\t', ' ') + '\' with \'' +
					data.records[i][1].replace('\t', ' ') + '\'.');
			} else {
				// data.errors.info.push('Skipped \'' +
				// 	data.records[i][0].replace('\t', ' ') + '\', not in document.');
			}
		}
		app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
	}
	if (VERBOSITY > 0) {
		messages = data.errors.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.errors.info);
		if (messages.length > 0) report(messages, 'Fonts: ' + counter + ' replaced');
	}

	/**
	 * Reads a TSV (tab-separated-values) file, returning an object containing found records and errors.
	 * Blank lines and those prefixed with `#` are ignored. A line ending in `\` continues on the next line.
	 * Include records from another file with `@path/to/include.txt` or the `@default` data file.
	 * @param {File} dataFile - A tab-separated-values file (object).
	 * @param {boolean} flgR - Internal flag for recursive calls (`@include`).
	 * @returns {{records: array, errors: { info: array, warn: array, fail: array }}}
	 */
	function parseDataFile(dataFile, flgR) {
		var record, part, include, includeFile;
		var records = [];
		var errors = { info: [], warn: [], fail: [] };
		var tmpData = [];
		var isHeaderFound = false;
		var line = 0;
		dataFile.open('r');
		dataFile.encoding = 'UTF-8';
		while (!dataFile.eof) {
			line++;
			record = (part ? part.slice(0,-1) : '') + dataFile.readln();
			if (record.slice(-1) === '\\') { part = record; continue; } else { part = ''; } // '\': Line continues
			if (record.replace(/^\s+|\s+$/g, '') === '') continue; // Blank line, skip
			if (record.slice(0,1) === '\u0023') continue;          // '#': Comment line, skip
			if (record.slice(0,1) === '\u0040') {                  // '@': Include directive, parse file
				include = record.slice(1).replace(/^\s+|\s+$/g, '').replace(/^['"]+|['"]+$/g, '');
				includeFile = /^default(s?)$/i.test(include) ?
					getDataFile(decodeURI(dataFile.name).replace(/^_/, ''), true) : // Default data file
					File(include); // 'path/to/file.txt'
				if (includeFile && includeFile.exists) {
					if (includeFile.fullName === dataFile.fullName) continue; // Skip self
					tmpData = parseDataFile(includeFile, true);
					records = records.concat(tmpData.records);
					errors = {
						info: errors.info.concat(tmpData.errors.info),
						warn: errors.warn.concat(tmpData.errors.warn),
						fail: errors.fail.concat(tmpData.errors.fail)
					};
				} else {
					errors.warn.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line +
					': \'' + include + '\' not found.');
				}
				continue;
			}
			if (!isHeaderFound) { isHeaderFound = true; continue; } // Header line, skip
			record = record.split(/ *\t */);
			checkRecord();
		}
		dataFile.close(); record = '';
		return { records: records, errors: { info: errors.info, warn: errors.warn, fail: errors.fail } };

		function checkRecord() {
			var tmpErrors = { info: [], warn: [], fail: [] };
			if (!record[0] || !record[2])
				tmpErrors.warn.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line + ': Missing font name.');
			if (!record[1] || !record[3])
				tmpErrors.warn.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line + ': Missing font style.');
			if (app.fonts.item(record[2] + '\t' + record[3]).status !== FontStatus.INSTALLED) {
				tmpErrors.warn.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line +
				': Font \'' + (record[2] + ' ' + record[3]).replace(/\t/g, ' ') + '\' is not installed.');
			}
			if (tmpErrors.warn.length === 0 && tmpErrors.fail.length === 0) {
				records.push([
					record[0] + '\t' + record[1],
					record[2] + '\t' + record[3]
				]);
			}
			errors = {
				info: errors.info.concat(tmpErrors.info),
				warn: errors.warn.concat(tmpErrors.warn),
				fail: errors.fail.concat(tmpErrors.fail)
			};
		}
	}
}
