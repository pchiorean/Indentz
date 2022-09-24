/*
	Replace text snippets 22.9.24
	(c) 2022 Paul Chiorean (jpeg@basement.ro)

	Replaces a list of snippets from a 5-column TSV file named `snippets.tsv`:

	Find what              | Change to                 | Case sensitive | Whole word | Scope
	English instructions   | Deutsche anleitung        | yes            | yes
	The sample is for free | Das Sample ist kostenlos  | yes            | yes        | _DE$
	The sample is for free | L`échantillon est gratuit | yes            | yes        | _FR$
	12.06.22               | 13.11.2022
	...

	<Find what>: text to be replaced (you can use find and replace special characters)
	<Change to>: the new text
	<Case sensitive>: `yes` or `no` (defaults to `yes`)
	<Whole word>: `yes` or `no` (defaults to `yes`)
	<Scope>: replacement will only be done if the file name matches this regular expression

	The TSV file must be saved locally (in the active document folder or its parent folder) or as a global default
	(on the desktop, next to the script, or in Indentz root); local files and files starting with `_` take precedence.
	Blank lines and those starting with `#` are ignored. A line ending in `\` continues on the next line.
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
	UndoModes.ENTIRE_SCRIPT, 'Replace text snippets');

function main() {
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, data, messages, i, n;
	var dataFileName = 'snippets.tsv';
	var counter = 0;

	if (doc.converted && VERBOSITY > 0) {
		alert('Can\'t get document path.\nThe document was converted from a previous InDesign version. ' +
		'The default snippet substitution list will be used.');
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
			if (data.records[i].scope && !data.records[i].scope.test(decodeURI(doc.name.replace(/.[^.]+$/, '')))) {
				data.status.info.push(data.records[i].source + 'Out of scope.');
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
				data.status.info.push(data.records[i].source +
					'Replaced ' + data.records[i].findWhat + '\' with \'' + data.records[i].changeTo + '\'.');
			} else {
				data.status.info.push(data.records[i].source + '\'' + data.records[i].findWhat + '\' not found.');
			}
		}
	}
	if (VERBOSITY > 0) {
		messages = data.status.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.status.info);
		if (messages.length > 0) report(messages, 'Snippets: ' + counter + ' replaced', 'auto');
		else if (VERBOSITY > 1 && counter === 0) alert('No replacements made.');
	}

	/**
	 * Reads a TSV (tab-separated-values) file, returning an object containing found records and errors.
	 * Blank lines and those starting with `#` are ignored. A line ending in `\` continues on the next line.
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
			var include = record.replace(/ +$/g, '').replace(/ ['"]|['"]$/g, '');
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
						if (!/\.(tsv|txt)$/i.test(include[2])) {
							status.warn.push(source + '\'' + decodeURI(include[2]) + '\' is not a TSV file.');
							return;
						}
						if (File(include[2]).exists) {
							includeFile = File(include[2]);
						} else {
							status.warn.push(source + '\'' + decodeURI(include[2]) + '\' not found.');
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
						status.info.push(source + 'Default list \'' + decodeURI(dataFileName) + '\' not found.');
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
			var tmpRecord = {
				source: source,
				findWhat: record[0],
				changeTo: record[1],
				caseSensitive: record[2] ? (record[2].toLowerCase() === 'yes') : true,
				wholeWord:     record[3] ? (record[3].toLowerCase() === 'yes') : true,
				scope:         record[4] ? RegExp(record[4], 'g') : ''
			};
			if (!tmpRecord.findWhat) tmpStatus.fail.push(tmpRecord.source + 'Missing text to be replaced.');
			if (tmpStatus.warn.length === 0 && tmpStatus.fail.length === 0) records.push(tmpRecord);
			status = {
				info: status.info.concat(tmpStatus.info),
				warn: status.warn.concat(tmpStatus.warn),
				fail: status.fail.concat(tmpStatus.fail)
			};
		}
	}
}
