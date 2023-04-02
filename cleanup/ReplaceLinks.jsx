/*
	Replace links 23.4.2
	(c) 2021-2023 Paul Chiorean <jpeg@basement.ro>

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
// @include 'isInArray.jsxinc';
// @include 'progressBar.jsxinc';
// @include 'report.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Replace links');

function main() {
	var title = 'Replace links';
	var dataFileName = [ 'links.tsv', 'links.txt' ];
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: FAIL, 1: +WARN, 2: +INFO
	var file, messages, i, j, d, progressBar;
	var parsed = { header: [], data: [], errors: [] };
	var data = { records: [], status: { info: [], warn: [], fail: [] } };
	var counter = 0;
	var links = doc.links.everyItem().getElements();
	var linkS = (function () {
		var s = [];
		for (i = 0; i < links.length; i++) s.push(links[i].name);
		return s;
	}());
	var docHasPath = (function () {
		var ret = false;
		try { ret = !!doc.filePath; } catch (e) {}
		return ret;
	}());

	if (!docHasPath && VERBOSITY > 0)
		alert('Can\'t get document path.\nThe default swatch substitution list will be used.');

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
		if ((d = checkRecord(parsed.data[i].record))) data.records.push(d);
	if (data.status.fail.length > 0) { report(data.status.fail, title); exit(); }

	// Processing
	if (links.length > 2 && data.records.length > 2) progressBar = new ProgressBar(title, links.length);
	for (i = 0; i < links.length; i++) {
		if (progressBar) progressBar.update();
		for (j = 0; j < data.records.length; j++) {
			data.records[j].newLink = compactRelPath(data.records[j].newLink);
			if (!isInArray(links[i].name, data.records[j].oldLinks)) continue; // Skip not matched
			if (File(links[i].filePath).fullName === File(data.records[j].newLink).fullName // Skip self
					&& links[i].status !== LinkStatus.LINK_OUT_OF_DATE)
				continue;
			stat(data.status, data.records[j].source,
				'Relinked \'' + decodeURI(links[i].name) + '\' with \'' + data.records[j].newLink + '\'.', 0);
			links[i].relink(File(data.records[j].newLink));
			counter++;
			if (ScriptUI.environment.keyboardState.keyName === 'Escape') exit();
		}
	}

	// Closing up
	if (progressBar) progressBar.close();
	if (VERBOSITY > 0) {
		messages = data.status.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.status.info);
		if (messages.length > 0) report(messages, 'Links: ' + counter + ' replaced', 'auto');
		else if (VERBOSITY > 1 && counter === 0) alert('No links replaced.');
	}

	/**
	 * Reads a TSV (tab-separated-values) file, returning an object containing found records and errors.
	 * Blank lines and those starting with `#` are ignored. A line ending in `\` continues on the next line.
	 * Use `@defaults` to include the global default, or `@include path/to/another.tsv` for other file.
	 * The path can be absolute, or relative to the data file; a default path can be set with `@includepath path/to`.
	 * @version 22.12.4-RL
	 * @author Paul Chiorean <jpeg@basement.ro>
	 * @license MIT
	 * @param {File} dataFile - A tab-separated-values file (object).
	 * @param {(string|string[])} [defaultName] - Default data file name, or an array of file names (used for `@defaults`).
	 * @returns {{ header: [], data: [ { record: [], source: [] }, {}, ... ], errors: [] }}
	 */
	function parseDataFile(dataFile, defaultName) {
		var record, part, src, includeFolder;
		var parsed = { header: [], data: [], errors: [] };
		var isHeaderFound = false;
		var includeFile = '';
		var line = 0;

		dataFile = File(compactRelPath(dataFile.absoluteURI));
		dataFile.open('r');
		dataFile.encoding = 'UTF-8';
		// includeFolder = Folder(dataFile.path);
		includeFolder = Folder(doc.filePath + '/Links');

		while (!dataFile.eof) {
			line++;
			src = [ decodeURI(dataFile.absoluteURI), line ];
			record = (part ? part.slice(0,-1) : '') + dataFile.readln(); // Join continued line
			record = record.replace(/#(.+)?$/g, ''); // Trim everything after '#' (comments)
			record = record.replace(/^ +|[ \t]+$/g, ''); // Trim spaces at both ends
			if (record.slice(-1) === '\\') { part = record; continue; } else { part = ''; } // '\': Line continues
			if (record.replace(/^\s+|\s+$/g, '') === '') continue; // Blank line => skip
			if (record.slice(0,1) === '@') { parseInclude(); continue; } // Include directive => parse
			record = record.split(/ *\t */); // Split on \t & trim spaces
			if (!isHeaderFound) { isHeaderFound = true; parsed.header = record; continue; } // 1st valid line => header
			if (!/^~?\/{1,2}/.test(record[0])) record[0] = compactRelPath(includeFolder.absoluteURI + '/' + record[0]);
			parsed.data.push({ record: record, source: src });
		}
		dataFile.close();
		return parsed;

		function parseInclude() {
			var tmpParsed = {};
			var include = record.replace(/ +$/g, '').replace(/ ['"]|['"]$/g, '');
			include = include.match(/^@(include(?:path)?|defaults|default)(?: +)?(.+)?$/i);
			if (!include) {
				stat(parsed.errors, src.join(':'), '\'' + record + '\' is not recognized (see docs).');
				return;
			}

			switch (include[1]) {
				case 'includepath':
					if (include[2]) {
						if (!/^~?\/{1,2}/.test(include[2]))
							include[2] = Folder(dataFile.path).absoluteURI + '/' + include[2];
						include[2] = compactRelPath(include[2]);
						if (Folder(include[2]).exists) includeFolder = Folder(include[2]);
						else stat(parsed.errors, src.join(':'), 'Folder \'' + include[2] + '\' is not found.');
					} else {
						stat(parsed.errors, src.join(':'), '\'' + record + '\' is malformed (see docs).');
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
							stat(parsed.errors, src.join(':'), 'File \'' + decodeURI(include[2]) + '\' is not a TSV file.');
							return;
						}
						if (File(include[2]).exists) {
							includeFile = File(include[2]);
						} else {
							stat(parsed.errors, src.join(':'), 'File \'' + decodeURI(include[2]) + '\' is not found.');
							return;
						}
					} else {
						stat(parsed.errors, src.join(':'), '\'' + record + '\' is malformed (see docs).');
						return;
					}
					break;
				case 'default':
				case 'defaults':
					if (!defaultName) return;
					includeFile = getDataFile(defaultName, true);
					if (!includeFile || !includeFile.exists) {
						stat(parsed.errors, src.join(':'),
							'Default list \'' + defaultName.join('\' or \'') + '\' is not found.');
						return;
					}
					break;
			}

			if (includeFile.absoluteURI === dataFile.absoluteURI) return; // Skip self
			tmpParsed = parseDataFile(includeFile);
			parsed.data = parsed.data.concat(tmpParsed.data);
			parsed.errors = parsed.errors.concat(tmpParsed.errors);
		}
	}

	/**
	 * Returns the first occurrence of file `name`, first searching for a local one (in the current
	 * folder or the parent folder of the active document), then a default one (on the desktop or next
	 * to the running script). It also matches local files starting with `_`, which take precedence.
	 * @param {(string|string[])} name - The file name, or an array of file names.
	 * @param {boolean} [skipLocal=false] - If `true`, don't search locally.
	 * @returns {File|void} - File object if found, else `undefined`.
	 */
	function getDataFile(name, skipLocal) {
		var file = '';
		var doc = app.activeDocument;
		var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());
		if (name.constructor.name !== 'Array') name = Array(name);

		for (var i = 0; i < name.length; i++) {
			if (!skipLocal) {
				if (doc && doc.saved && (file = File(doc.filePath + '/_'    + name[i])) && file.exists) return file;
				if (doc && doc.saved && (file = File(doc.filePath + '/'     + name[i])) && file.exists) return file;
				if (doc && doc.saved && (file = File(doc.filePath + '/../_' + name[i])) && file.exists) return file;
				if (doc && doc.saved && (file = File(doc.filePath + '/../'  + name[i])) && file.exists) return file;
			}
			if ((file = File(Folder.desktop + '/'    + name[i])) && file.exists) return file;
			if ((file = File(script.path    + '/'    + name[i])) && file.exists) return file;
			if ((file = File(script.path    + '/../' + name[i])) && file.exists) return file;
		}
		return undefined;
	}

	function compactRelPath(/*string*/str) {
		str = str.replace(/^\.\/|\/\.$/, '')   // Trim './' and '/.
			.replace(/\/\.\//g, '/')           // Trim '/./'
			.replace(/\/[^\/]+\/\.{2}\//, '/') // Resolve '/../'
			.replace(/\/+/g, '/');             // Compact '//'
		if (/\/\.{2}\//.test(str)) str = compactRelPath(str);
		return str;
	}

	function checkRecord(/*array*/record) {
		var tmpData = {};

		tmpData.source = parsed.data[i].source.join(':');

		var newLink = (function () {
			record[0] = compactRelPath(record[0]);
			return record[0];
		}());
		var oldLinks = (function () {
			var o = newLink.slice(newLink.lastIndexOf('/') + 1);
			if (record[1]) o += ',' + record[1];
			return unique(o.split(/ *, */));
		}());

		// Check if document has at least one link from oldLinks
		var isLinkUsed = (function () {
			if (linkS.length > 0) {
				for (var i = 0; i < linkS.length; i++)
					if (isInArray(linkS[i], oldLinks)) return true;
			}
			return false;
		}());

		// Check if newLink is actually used and valid
		if (!isLinkUsed) {
			// stat(data.status, tmpData.source + ':1',
			// 	'Skipped \'' + decodeURI(newLink) + '\' because it\'s not used.', 0);
			return false;
		} else if (!File(newLink).exists) {
			stat(data.status, tmpData.source + ':1',
				'New link \'' + decodeURI(newLink) + '\' is not found.', -1);
			return false;
		}

		tmpData.newLink = newLink;
		tmpData.oldLinks = oldLinks;

		return tmpData;

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

	function stat(/*array|object*/target, /*string*/src, /*string*/msg, /*0=info|1=warn|-1=fail*/type) {
		var sep = ' :: ';
		type = (function (t) { // Numeric code => string (key)
			return {
				 '0': 'info',
				 '1': 'warn',
				'-1': 'fail'
			}[t] || 'warn';
		}(type));

		if (target instanceof Array) target.push(src + sep + msg);
		else target[type].push(src + sep + msg);

		return src + sep + msg;
	}
}
