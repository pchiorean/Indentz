/*
	Replace fonts 23.10.21
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Replaces fonts using a 4-column TSV file named `fonts.tsv`:

	Old font family | Style   | New font family | Style
	Arial           | Regular | Helvetica Neue  | Regular
	Arial           | Bold    | Helvetica Neue  | Bold
	...

	The TSV file must be saved locally (in the active document folder or its parent) or as a global
	default (on the desktop, next to the script, or in Indentz root); local files and those starting
	with `_` take precedence. Blank lines are ignored; everything after a `#` (comments) is ignored.
	A line ending in `\` continues on the next line. Use `@defaults` to include the global default,
	or `@include path/to/another.tsv` for other data file. The path can be absolute, or relative to
	the data file; a default path can be set with `@includepath path/to/`.

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

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Replace fonts');

function main() {
	var title = 'Replace fonts';
	var dataFileName = [ 'fonts.tsv', 'fonts.txt' ];
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: only errors, 1: + warnings, 2: + infos
	var file, messages, i, n;
	var parsed = { header: [], data: [], errors: [] };
	var data = { records: [], status: { info: [], warn: [], error: [] } };
	var counter = 0;
	var docHasPath = (function () {
		var ret = false;
		try { ret = !!doc.filePath; } catch (e) {}
		return ret;
	}());

	if (!docHasPath && VERBOSITY > 1)
		alert('Can\'t get document path.\nThe default swatch substitution list will be used.');

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
			stat(data.status, data.records[i].source,
				'Replaced \''
				+ data.records[i].findWhat.replace('\t', ' ') + '\' with \''
				+ data.records[i].changeTo.replace('\t', ' ') + '\'.', 0);
		} else {
			stat(data.status, data.records[i].source,
				'Skipped \'' + data.records[i].findWhat.replace('\t', ' ') + '\' because it\'s not in use.', 0);
		}
	}

	// Closing up
	app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
	if (VERBOSITY > 0) {
		messages = data.status.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.status.info);
		if (messages.length > 0) report(messages, 'Fonts: ' + counter + ' replaced', 'auto');
		else if (VERBOSITY > 1 && counter > 0) alert('No fonts replaced.');
	}

	function checkRecord(/*array*/record) {
		var tmpData = {};

		tmpData.source = parsed.data[i].source.join(':');

		if (!record[0] || !record[2]) stat(data.status, tmpData.source, 'Missing font name.', -1);
		if (!record[1] || !record[3]) stat(data.status, tmpData.source, 'Missing font style.', -1);

		if ((record[2] && record[3]) && app.fonts.item(record[2] + '\t' + record[3]).status !== FontStatus.INSTALLED) {
			stat(data.status, tmpData.source,
				'Font \'' + (record[2] + ' ' + record[3]).replace(/\t/g, ' ') + '\' is not installed.', -1);
		}

		tmpData.findWhat = record[0] + '\t' + record[1];
		tmpData.changeTo = record[2] + '\t' + record[3];

		if (data.status.error.length > 0) return false;
		return tmpData;
	}
}
