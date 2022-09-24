/*
	Replace links 22.9.24
	(c) 2021-2022 Paul Chiorean (jpeg@basement.ro)

	Replaces document links from a 2-column TSV file named `links.tsv`:

	New link path            | Document links
	path/to/img1.psd         | img1.*
	@includepath path/to
	img2-cmyk.tif            | img2_lowres.jpg, img2-rgb.*
	img3.tif                 | [img3.tif]
	...

	<New link path>: an absolute path, or relative to the data file, or relative to `@includepath`
	<Document links>: a list of document links that will be relinked if found (case insensitive;
		`*` and `?` wildcards accepted); if the list is empty, the new link`s name will be used.

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
// @include 'isInArray.jsxinc';
// @include 'progressBar.jsxinc';
// @include 'report.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Replace links');

function main() {
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, data, messages, i, j, progressBar;
	var dataFileName = 'links.tsv';
	var counter = 0;
	var links = doc.links.everyItem().getElements();
	var linkS = (function () {
		var s = [];
		for (i = 0; i < links.length; i++) s.push(links[i].name);
		return s;
	}());

	if (doc.converted && VERBOSITY > 0) {
		alert('Can\'t get document path.\nThe document was converted from a previous InDesign version. ' +
		'The default link substitution list will be used.');
	}
	if (!(file = getDataFile(dataFileName))) {
		if (VERBOSITY > 1) {
			alert('Can\'t locate substitution a list \'' + dataFileName +
			'\'.\nThe file must be saved in the current folder, on the ' +
			'desktop, or next to the script. Check docs for details.');
		}
		exit();
	}

	data = parseDataFile(file);
	if (data.status.fail.length > 0) { report(data.status.fail, decodeURI(file.getRelativeURI(doc.filePath))); exit(); }
	if (data.records.length > 0) {
		if (links.length > 2) progressBar = new ProgressBar('Replace links', links.length);
		for (i = 0; i < links.length; i++) {
			if (progressBar) progressBar.update();
			for (j = 0; j < data.records.length; j++) {
				data.records[j].newLink = compactRelPath(data.records[j].newLink);
				if (!isInArray(links[i].name, data.records[j].oldLinks)) continue; // Skip not matched
				if (File(links[i].filePath).fullName === File(data.records[j].newLink).fullName // Skip self
						&& links[i].status !== LinkStatus.LINK_OUT_OF_DATE)
					continue;
				data.status.info.push(data.records[j].source +
					'Relinked \'' + decodeURI(links[i].name) + '\' with \'' +
					data.records[j].newLink.slice(data.records[j].newLink.lastIndexOf('/') + 1) + '\'.');
				links[i].relink(File(data.records[j].newLink));
				counter++;
				if (ScriptUI.environment.keyboardState.keyName === 'Escape') exit();
			}
		}
	}

	if (progressBar) progressBar.close();
	if (VERBOSITY > 0) {
		messages = data.status.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.status.info);
		if (messages.length > 0) report(messages, 'Links: ' + counter + ' replaced', 'auto');
		else if (VERBOSITY > 1 && counter === 0) alert('No links replaced.');
	}

	function compactRelPath(/*string*/str) {
		str = str.replace(/^\.\/|\/\.$/, '').replace(/\/\.\//g, '/'); // Trim '.'
		str = str.replace(/\/[^\/]+\/\.{2}/g, '/'); // Resolve '..'
		str = str.replace(/\/+/g, '/'); // Compact '//'
		return str;
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
		// includeFolder = Folder(dataFile.path);
		includeFolder = Folder(doc.filePath + '/Links');

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
						// if (!/^~?\/{1,2}/.test(include[2])) include[2] = includeFolder.absoluteURI + '/' + include[2];
						if (!/^~?\/{1,2}/.test(include[2])) {
							if (includeFolder.absoluteURI === Folder(doc.filePath + '/Links').absoluteURI)
								include[2] = Folder(dataFile.path) + '/' + include[2];
							else include[2] = includeFolder.absoluteURI + '/' + include[2];
						}
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
			var newLink = (function () {
				if (!/^~?\/{1,2}/.test(record[0])) record[0] = includeFolder.absoluteURI + '/' + record[0];
				record[0] = compactRelPath(record[0]);
				return record[0];
			}());
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
					records.push({
						source: source,
						newLink: newLink,
						oldLinks: oldLinks
					});
				} else {
					tmpStatus.warn.push(source +
						'Skipped \'' + newLink.slice(newLink.lastIndexOf('/') + 1) + '\', file not found.');
				}
			} else {
				tmpStatus.info.push(source +
					'Skipped \'' + newLink.slice(newLink.lastIndexOf('/') + 1) + '\', not in document.');
			}
			status = {
				info: status.info.concat(tmpStatus.info),
				warn: status.warn.concat(tmpStatus.warn),
				fail: status.fail.concat(tmpStatus.fail)
			};
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
}
