/*
	Replace text snippets 22.7.5
	(c) 2022 Paul Chiorean (jpeg@basement.ro)

	Replaces a list of snippets from a 4-column TSV file named 'snippets.txt':

	Find what              | Change to                 | Case sensitive | Whole word | Scope
	English instructions   | Deutsche anleitung        | yes            | yes
	The sample is for free | Das Sample ist kostenlos  | yes            | yes        | _DE$
	The sample is for free | L'échantillon est gratuit | yes            | yes        | _FR$
	12.06.22               | 13.11.2022
	...
	1. <Find what>: text to be replaced
	2. <Change to>: the new text
	3. <Case sensitive>: 'yes' or 'no' (default 'yes')
	4. <Whole word>: 'yes' or 'no' (default 'yes')
	5. <Scope>: replacement will only be done if the filename matches this regular expression

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
// @include '../lib/ReplaceText.jsxinc';
// @include '../lib/Report.jsxinc';

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Replace text snippets');

function main() {
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, data, messages, i, n;
	var counter = 0;

	if (doc.converted && VERBOSITY > 0) {
		alert('Can\'t get document path.\nThe document was converted from a previous InDesign version. ' +
		'The default snippet substitution list will be used.');
	}
	if (!(file = getDataFile('snippets.txt'))) {
		if (VERBOSITY > 1) {
			alert('Can\'t locate a snippet substitution list.\nThe file must be saved in the current folder, ' +
			'on the desktop, or next to the script. Check docs for details.');
		}
		exit();
	}

	data = parseDataFile(file);
	if (data.errors.fail.length > 0) { report(data.errors.fail, decodeURI(file.getRelativeURI(doc.filePath))); exit(); }
	if (data.records.length > 0) {
		for (i = 0, n = data.records.length; i < n; i++) {
			if (data.records[i].scope && !data.records[i].scope.test(decodeURI(doc.name))) {
				data.errors.info.push('\'' + data.records[i].findWhat + '\' not replaced (out of scope).');
				continue;
			}
			app.findTextPreferences   = NothingEnum.NOTHING;
			app.changeTextPreferences = NothingEnum.NOTHING;
			app.findChangeTextOptions.includeLockedLayersForFind  = false;
			app.findChangeTextOptions.includeLockedStoriesForFind = false;
			app.findChangeTextOptions.includeHiddenLayers = true;
			app.findChangeTextOptions.includeMasterPages  = true;
			app.findChangeTextOptions.includeFootnotes    = true;
			app.findChangeTextOptions.caseSensitive = data.records[i].caseSensitive;
			app.findChangeTextOptions.wholeWord     = data.records[i].wholeWord;
			app.findTextPreferences.findWhat   = data.records[i].findWhat;
			app.changeTextPreferences.changeTo = data.records[i].changeTo;
			if (doc.changeText().length > 0) {
				counter++;
				data.errors.info.push('\'' + data.records[i].findWhat +
					'\' replaced with \'' + data.records[i].changeTo + '\'.');
			} else {
				data.errors.info.push('\'' + data.records[i].findWhat + '\' not found.');
			}
		}
	}
	if (VERBOSITY > 0) {
		messages = data.errors.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.errors.info);
		if (messages.length > 0) report(messages, 'Snippets: ' + counter + ' replaced');
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
			record = record.replace(/^\s+|\s+$/g, '');
			record = record.split(/ *\t */);
			checkRecord();
		}
		dataFile.close(); record = '';
		return { records: records, errors: { info: errors.info, warn: errors.warn, fail: errors.fail } };

		function checkRecord() {
			var tmpErrors = { info: [], warn: [], fail: [] };
			if (!record[0]) {
				tmpErrors.warn.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') +
					line + ': Missing text to be replaced.');
			}
			if (tmpErrors.warn.length === 0 && tmpErrors.fail.length === 0) {
				records.push({
					findWhat: record[0],
					changeTo: record[1],
					caseSensitive: record[2] ? (record[2].toLowerCase() === 'yes') : true,
					wholeWord:     record[3] ? (record[3].toLowerCase() === 'yes') : true,
					scope:         record[4] ? RegExp(record[4], 'g') : ''
				});
			}
			errors = {
				info: errors.info.concat(tmpErrors.info),
				warn: errors.warn.concat(tmpErrors.warn),
				fail: errors.fail.concat(tmpErrors.fail)
			};
		}
	}
}
