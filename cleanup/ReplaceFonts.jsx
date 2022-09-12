/*
	Replace fonts 22.9.12
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

	Replaces fonts from a 4-column TSV file named `fonts.tsv`:

	Old font | Style   | New font       | Style
	Arial    | Regular | Helvetica Neue | Regular
	Arial    | Bold    | Helvetica Neue | Bold
	...

	The TSV file must be saved locally (in the active document folder or its parent folder) or as a global default
	(on the desktop, next to the script, or in Indentz root); local files and files starting with `_` take precedence.
	Blank lines and those prefixed with `#` are ignored. A line ending in `\` continues on the next line.
	Use `@defaults` to include the global default, or `@include path/to/another.tsv` for other file.
	The path can be absolute, or relative to the data file; a default path can be set with `@includepath path/to`.

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
// @include 'getDataFile.jsxinc';
// @include 'report.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Replace fonts');

function main() {
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, data, messages, i, n;
	var dataFileName = 'fonts.tsv';
	var counter = 0;

	if (doc.converted && VERBOSITY > 0) {
		alert('Can\'t get document path.\nThe document was converted from a previous InDesign version. ' +
		'The default font substitution list will be used.');
	}
	if (!(file = getDataFile(dataFileName))) {
		if (VERBOSITY > 1) {
			alert('Can\'t locate a substitution list \'' + dataFileName +
			'\'.\nThe file must be saved in the current folder, on the ' +
			'desktop, or next to the script. Check docs for details.');
		}
		exit();
	}

	data = parseDataFile(file);
	if (data.status.fail.length > 0) { report(data.status.fail, decodeURI(file.getRelativeURI(doc.filePath))); exit(); }
	if (data.records.length > 0) {
		for (i = 0, n = data.records.length; i < n; i++) {
			app.findTextPreferences = app.changeTextPreferences   = NothingEnum.NOTHING;
			app.findChangeTextOptions.includeHiddenLayers         = true;
			app.findChangeTextOptions.includeLockedLayersForFind  = true;
			app.findChangeTextOptions.includeLockedStoriesForFind = true;
			app.findChangeTextOptions.includeMasterPages          = true;
			app.findTextPreferences.appliedFont                   = data.records[i].findWhat;
			app.changeTextPreferences.appliedFont                 = data.records[i].changeTo;
			if (doc.changeText().length > 0) {
				counter++;
				data.status.info.push(data.records[i].source +
					'Replaced \'' +
					data.records[i].findWhat.replace('\t', ' ') + '\' with \'' +
					data.records[i].changeTo.replace('\t', ' ') + '\'.');
			} else {
				data.status.info.push(data.records[i].source +
					'Skipped \'' + data.records[i].findWhat.replace('\t', ' ') + '\', not in use.');
			}
		}
		app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
	}
	if (VERBOSITY > 0) {
		messages = data.status.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.status.info);
		if (messages.length > 0) report(messages, 'Fonts: ' + counter + ' replaced');
		else if (VERBOSITY > 1 && counter > 0) alert('No fonts replaced.');
	}

	/**
	 * Reads a TSV (tab-separated-values) file, returning an object containing found records and errors.
	 * Blank lines and those prefixed with `#` are ignored. A line ending in `\` continues on the next line.
	 * Use `@defaults` to include the global default, or `@include path/to/another.tsv` for other file.
	 * The path can be absolute, or relative to the data file; a default path can be set with `@includepath path/to`.
	 * @version 22.9.11
	 * @author Paul Chiorean <jpeg@basement.ro>
	 * @license MIT
	 * @param {File} dataFile - A tab-separated-values file (object).
	 * @returns {{records: array, status: { info: array, warn: array, fail: array }}}
	 */
	function parseDataFile(dataFile) {
		var record, part, source, includeFolder;
		var records = [];
		var status = { info: [], warn: [], fail: [] };
		var isHeaderFound = false;
		var line = 0;
		var includeFile = '';

		dataFile = File(compactRelPath(dataFile.absoluteURI));
		dataFile.open('r');
		dataFile.encoding = 'UTF-8';
		includeFolder = Folder(dataFile.path);

		while (!dataFile.eof) {
			line++;
			source = decodeURI(dataFile.absoluteURI) + ':' + line + ' :: ';
			record = (part ? part.slice(0,-1) : '') + dataFile.readln();
			if (record.slice(-1) === '\\') { part = record; continue; } else { part = ''; } // '\': Line continues
			if (record.replace(/^\s+|\s+$/g, '') === '') continue;            // Blank line, skip
			if (record.slice(0,1) === '\u0023') continue;                     // '#': Comment line, skip
			if (record.slice(0,1) === '\u0040') { parseInclude(); continue; } // '@': Include directive, parse
			if (!isHeaderFound) { isHeaderFound = true; continue; }           // Header line, skip
			record = record.replace(/#.+$/g, '');    // Trim end comment
			record = record.replace(/^ +| +$/g, ''); // Trim spaces at both ends
			record = record.split(/ *\t */); // Split on \t & trim spaces
			checkRecord();
		}
		dataFile.close();
		record = '';

		return {
			records: records,
			status: { info: status.info, warn: status.warn, fail: status.fail }
		};

		function compactRelPath(/*string*/str) {
			str = str.replace(/^\.\/|\/\.$/, '').replace(/\/\.\//g, '/'); // Trim '.'
			str = str.replace(/\/[^\/]+\/\.{2}/g, '/'); // Resolve '..'
			str = str.replace(/\/+/g, '/'); // Compact '//'
			return str;
		}

		function parseInclude() {
			var tmpData = [];
			var include = record.replace(/['"]+/g, '').replace(/\s+$/g, '');
			include = include.match(/^@(include(?:path)?|defaults|default)(?: +)?(.+)?$/i);
			if (!include) {
				status.warn.push(source + '\'' + record + '\' is not recognized (see docs).');
				return;
			}

			switch (include[1]) {
				case 'includepath':
					if (include[2]) {
						if (!/^~?\/{1,2}/.test(include[2])) include[2] = Folder(dataFile.path).absoluteURI + '/' + include[2];
						include[2] = compactRelPath(include[2]);
						if (Folder(include[2]).exists) includeFolder = Folder(include[2]);
						else status.warn.push(source + '\'' + include[2] + '\' not found.');
					} else {
						status.warn.push(source + '\'' + record + '\' is malformed (see docs).');
					}
					return;
				case 'include':
					if (include[2]) {
						if (!/^~?\/{1,2}/.test(include[2])) include[2] = includeFolder.absoluteURI + '/' + include[2];
						include[2] = compactRelPath(include[2]);
						if (File(include[2]).exists) {
							includeFile = File(include[2]);
						} else {
							status.warn.push(source + '\'' + include[2] + '\' not found.');
							return;
						}
					} else {
						status.warn.push(source + '\'' + record + '\' is malformed (see docs).');
						return;
					}
					break;
				case 'default':
				case 'defaults':
					includeFile = getDataFile(dataFileName, true);
					if (!includeFile || !includeFile.exists) {
						status.info.push(source + 'Default list \'' + dataFileName + '\' not found.');
						return;
					}
					break;
			}

			if (includeFile.absoluteURI === dataFile.absoluteURI) return; // Skip self
			tmpData = parseDataFile(includeFile);
			records = records.concat(tmpData.records);
			status = {
				info: status.info.concat(tmpData.status.info),
				warn: status.warn.concat(tmpData.status.warn),
				fail: status.fail.concat(tmpData.status.fail)
			};
		}

		function checkRecord() {
			var tmpStatus = { info: [], warn: [], fail: [] };
			if (!record[0] || !record[2]) tmpStatus.fail.push(source + 'Missing font name.');
			if (!record[1] || !record[3]) tmpStatus.fail.push(source + 'Missing font style.');
			if (app.fonts.item(record[2] + '\t' + record[3]).status !== FontStatus.INSTALLED) {
				tmpStatus.fail.push(source +
					'Font \'' + (record[2] + ' ' + record[3]).replace(/\t/g, ' ') + '\' is not installed.');
			}
			if (tmpStatus.warn.length === 0 && tmpStatus.fail.length === 0) {
				records.push({
					source: source,
					findWhat: record[0] + '\t' + record[1],
					changeTo: record[2] + '\t' + record[3]
				});
			}
			status = {
				info: status.info.concat(tmpStatus.info),
				warn: status.warn.concat(tmpStatus.warn),
				fail: status.fail.concat(tmpStatus.fail)
			};
		}
	}
}
