/*
	Replace links 1.0 (2021-10-09)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Replaces document links from a 2-column TSV file named 'links.txt':

	New link          | Old links
	link1.psd         | link1.jpg
	path/to/link2.psd | link2.jpg, link2.png
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
	UndoModes.ENTIRE_SCRIPT, 'Replace links');

function main() {
	var VERBOSITY = 0; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, data, messages, link, links;
	var counter = 0;
	if (!(file = getDataFile('links.txt'))) { alert('No data file found.'); exit(); }
	data = parseDataFile(file);
	if (data.errors.fail.length > 0) {
		report(data.errors.fail, 'Errors', false, true); exit();
	}

	for (var r = 0; r < data.records.length; r++) {
		links = doc.links.everyItem().getElements();
		while ((link = links.shift())) {
			if (!isIn(link.name, data.records[r].oldLinks)) continue; // Skip not matched
			if (File(link.filePath).fullName === File(data.records[r].newLink).fullName) continue; // Skip self
			link.relink(File(data.records[r].newLink));
			counter++;
			data.errors.info.push('Relinked \'' + decodeURI(link.name) + '\' with \'' +
				data.records[r].newLink.slice(data.records[r].newLink.lastIndexOf('/') + 1) + '\'.');
		}
	}
	if (VERBOSITY > 0) {
		messages = data.errors.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.errors.info);
		if (messages.length > 0) report(messages, counter + ' relinked', false, true);
	}

	/**
	 * Reads a TSV (tab-separated-values) file, returning an object containing found records and errors.
	 * Blank lines and those prefixed with `#` are ignored. Includes records from `@path/to/include.txt`
	 * or `@default` data file (see `getDataFile()`).
	 * @param {File} dataFile - A tab-separated-values file (object).
	 * @param {boolean} flgR - Flag for recursive call (`@include`).
	 * @returns {{records: array, errors: { info: array, warn: array, fail: array }}}
	 */
	function parseDataFile(dataFile, flgR) {
		var infoLine, include, includeFile;
		var buffer = [];
		var records = [];
		var errors = { info: [], warn: [], fail: [] };
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
					errors = {
						info: errors.info.concat(buffer.errors.info),
						warn: errors.warn.concat(buffer.errors.warn),
						fail: errors.fail.concat(buffer.errors.fail)
					};
				}
			} else { validateRecord(); }
		}
		dataFile.close(); infoLine = '';
		return { records: records, errors: { info: errors.info, warn: errors.warn, fail: errors.fail } };

		function validateRecord() {
			var oldLinks = infoLine[1] ? infoLine[1].split(/ *, */) : '';
			var newLink = /\//g.test(infoLine[0]) ? infoLine[0] : doc.filePath + '/Links/' + infoLine[0];
			if (function () { // Check if document has at least one link from oldLinks
					for (var i = 0; i < oldLinks.length; i++)
						if (isIn(oldLinks[i], doc.links.everyItem().getElements())) return true;
					return false;
				}()) {
				// Check if newLink is valid
				if (File(newLink).exists) {
					records.push({ newLink:  newLink, oldLinks: oldLinks });
				} else {
					errors.warn.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line +
					': Skipped \'' + newLink.slice(newLink.lastIndexOf('/') + 1) + '\': file not found.');
				}
			} else {
				errors.info.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line +
				': Skipped \'' + newLink.slice(newLink.lastIndexOf('/') + 1) + '\': link not found.');
			}
		}
	}

	function isIn(item, array) {
		for (var i = 0, n = array.length; i < n; i++) {
			if (item.constructor.name === 'String') {
				if ((array[i].constructor.name === 'Link' ? array[i].name : array[i])
					.lastIndexOf(item) !== -1) return true;
			} else if (item === array[i]) { return true; }
		}
		return false;
	}
}
