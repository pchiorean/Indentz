/*
	Replace links 22.3.17
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

	Replaces document links from a 2-column TSV file named 'links.txt':

	New link path    | Document links
	path/to/img1.psd | img1.*
	img2-cmyk.tif    | img2_lowres.jpg, img2-rgb.*
	...
	1. <New link path>: new link's absolute path, or just its name if it's in the same folder
	2. <Document links>: a list of document links that will be relinked if found
	   (case insensitive; '*' and '?' wildcards accepted)

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
// @include '../lib/IsInArray.jsxinc';
// @include '../lib/Report.jsxinc';

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Replace links');

function main() {
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, data, messages, i, r;
	var links = doc.links.everyItem().getElements();
	var linkS = (function () {
		var s = [];
		for (i = 0; i < links.length; i++) s.push(decodeURI(links[i].name));
		return s;
	}());

	var counter = 0;
	if (doc.converted && VERBOSITY > 0) {
		alert('Can\'t get document path.\nThe document was converted from a previous InDesign version. ' +
		'The default link substitution list will be used.');
	}
	if (!(file = getDataFile('links.txt'))) {
		if (VERBOSITY > 1) {
			alert('Can\'t locate a link substitution list.\nThe file must be saved in the current folder, ' +
			'on the desktop, or next to the script. Check docs for details.');
		}
		exit();
	}
	data = parseDataFile(file);
	if (data.errors.fail.length > 0) { report(data.errors.fail, decodeURI(file.getRelativeURI(doc.filePath))); exit(); }
	if (data.records.length > 0) {
		for (i = 0; i < links.length; i++) {
			for (r = 0; r < data.records.length; r++) {
				if (!isInArray(links[i].name, data.records[r].oldLinks)) continue; // Skip not matched
				if (File(links[i].filePath).fullName === File(data.records[r].newLink).fullName &&
					links[i].status !== LinkStatus.LINK_OUT_OF_DATE) continue; // Skip self
				links[i].relink(File(data.records[r].newLink));
				counter++;
				data.errors.info.push('Relinked \'' + decodeURI(links[i].name) + '\' with \'' +
					data.records[r].newLink.slice(data.records[r].newLink.lastIndexOf('/') + 1) + '\'.');
			}
		}
	}
	if (VERBOSITY > 0) {
		messages = data.errors.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.errors.info);
		if (messages.length > 0) report(messages, 'Links: ' + counter + ' changed');
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
			var newLink = /\//g.test(record[0]) ? record[0] : doc.filePath + '/Links/' + record[0];
			var oldLinks = (function () {
				var o = newLink.slice(newLink.lastIndexOf('/') + 1);
				if (record[1]) o += ',' + record[1];
				return unique(o.split(/ *, */));
			}());
			// Check if document has at least one link from oldLinks
			var docHasLink = (function () {
				if (linkS.length > 0) {
					for (var i = 0; i < linkS.length; i++)
						if (isInArray(linkS[i], oldLinks)) return true;
				}
				return false;
			}());
			// Check if newLink is valid
			if (docHasLink) {
				if (File(newLink).exists) {
					records.push({ newLink: newLink, oldLinks: oldLinks });
				} else {
					tmpErrors.warn.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line +
					': Skipped \'' + newLink.slice(newLink.lastIndexOf('/') + 1) + '\', file not found.');
				}
			} else {
				// tmpErrors.info.push((flgR ? decodeURI(dataFile.name) + ':' : 'Line ') + line +
				// ': Skipped \'' + newLink.slice(newLink.lastIndexOf('/') + 1) + '\', link not found.');
			}
			errors = {
				info: errors.info.concat(tmpErrors.info),
				warn: errors.warn.concat(tmpErrors.warn),
				fail: errors.fail.concat(tmpErrors.fail)
			};
		}
	}

	// Get unique array elements
	// http://indisnip.wordpress.com/2010/08/24/findchange-missing-font-with-scripting/
	function unique(/*array*/array) {
		var i, j;
		var r = [];
		o: for (i = 0; i < array.length; i++) {
			for (j = 0; j < r.length; j++) if (r[j] === array[i]) continue o;
			if (array[i] !== '') r[r.length] = array[i];
		}
		return r;
	}
}
