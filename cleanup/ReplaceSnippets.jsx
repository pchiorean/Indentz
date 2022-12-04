/*
	Replace text snippets 22.12.4
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
	<Scope>: replacement will only be done if the document name matches this regular expression

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
// @include 'parseDataFile.jsxinc';
// @include 'report.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Replace text snippets');

function main() {
	var title = 'Replace text snippets';
	var dataFileName = [ 'snippets.tsv', 'snippets.txt' ];
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, messages, i, n;
	var parsed = { header: [], data: [], errors: [] };
	var data = { records: [], status: { info: [], warn: [], fail: [] } };
	var counter = 0;

	if (doc.converted && VERBOSITY > 0) {
		alert('Can\'t get document path.\nThe document was converted from a previous InDesign version. ' +
			'The default swatch substitution list will be used.');
	}

	// Get raw data from TSV
	if (!(file = getDataFile(dataFileName))) { // No data file found
		if (VERBOSITY > 1) {
			alert('Can\'t locate a substitution list \'' +
				(dataFileName.constructor.name === 'Array' ? dataFileName.join('\' or \'') : dataFileName) +
				'\'.\nThe file must be saved in the current folder, on the desktop, or next to the script. ' +
				'Check docs for details.');
		}
		exit();
	}
	parsed = parseDataFile(file, dataFileName);
	if (parsed.errors.length > 0) { report(parsed.errors, title); exit(); }

	// Build structured data
	for (i = 0; i < parsed.data.length; i++)
		data.records[i] = checkRecord(parsed.data[i].record);
	if (data.status.fail.length > 0) { report(data.status.fail, title); exit(); }

	// Processing
	for (i = 0, n = data.records.length; i < n; i++) {
		if (data.records[i].scope && !data.records[i].scope.test(decodeURI(doc.name.replace(/.[^.]+$/, '')))) {
			stat(data.status, data.records[i].source,
				'\'' + data.records[i].findWhat + '\' is out of scope ' + data.records[i].scope + '.', 0);
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
			stat(data.status, data.records[i].source,
				'Replaced ' + data.records[i].findWhat + '\' with \'' + data.records[i].changeTo + '\'.', 0);
		} else {
			stat(data.status, data.records[i].source, '\'' + data.records[i].findWhat + '\' is not found.', 0);
		}
	}

	// Closing up
	if (VERBOSITY > 0) {
		messages = data.status.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.status.info);
		if (messages.length > 0) report(messages, 'Snippets: ' + counter + ' replaced', 'auto');
		else if (VERBOSITY > 1 && counter === 0) alert('No replacements made.');
	}

	function checkRecord(/*array*/record) {
		var tmpData = {};

		tmpData.source = parsed.data[i].source.join(':');
		tmpData.findWhat = record[0];
		tmpData.changeTo = record[1];
		tmpData.caseSensitive = record[2] ? (record[2].toLowerCase() === 'yes') : true;
		tmpData.wholeWord = record[3] ? (record[3].toLowerCase() === 'yes') : true;
		tmpData.scope = record[4] ? RegExp(record[4], 'g') : '';

		if (!tmpData.findWhat) stat(data.status, tmpData.source + ':1', 'Missing text to be replaced.', -1);

		if (data.status.fail.length > 0) return false;
		return tmpData;
	}
}
