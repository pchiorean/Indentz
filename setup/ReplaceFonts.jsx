/*
	Replace fonts 2.1.3 (2021-08-18)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Replaces fonts from a 4-column TSV file named "fonts.txt":

	Old font | Style   | New font       | Style
	Arial    | Regular | Helvetica Neue | Regular
	Arial    | Bold    | Helvetica Neue | Bold
	...

	The file can be saved in the current folder, on the desktop, or next to the script.
	Blank lines and those prefixed with "#" are ignored; "@file.txt" includes records from 'file.txt'.

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

var infoFile, infoFilename = "fonts.txt";
if (!(infoFile = FindFile(infoFilename))) { alert("File '" + infoFilename + "' not found."); exit() };

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Replace fonts");

function main() {
	var data = ParseInfo(infoFile);
	if (data.errors.length > 0) { Report(data.errors, decodeURI(infoFile.getRelativeURI(doc.filePath))); exit() };
	if (data.records.length == 0) exit();

	for (var i = 0, n = data.records.length; i < n; i++) {
		app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
		app.findChangeTextOptions.includeHiddenLayers = true;
		app.findChangeTextOptions.includeLockedLayersForFind = true;
		app.findChangeTextOptions.includeLockedStoriesForFind = true;
		app.findChangeTextOptions.includeMasterPages = true;
		app.findTextPreferences.appliedFont = data.records[i][0];
		app.changeTextPreferences.appliedFont = data.records[i][1];
		doc.changeText();
	};
	app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
};

/**
 * Parses a TSV file, returning an object containing found records and errors. Ignores blank lines and those prefixed
 * with '#'; '@path/to/file.txt' includes records from 'file.txt', '@default' includes the default info file.
 * @param {File} infoFile - Tab-separated-values file object
 * @returns {{records: Array, errors: Array}}
 */
function ParseInfo(infoFile) {
	var buffer = [], records = [], errors = [], infoLine, header, flgHeader = false, line = 0;
	infoFile.open("r");
	while (!infoFile.eof) {
		infoLine = infoFile.readln(); line++;
		if (infoLine.replace(/^\s+|\s+$/g, "") == "") continue; // Ignore blank lines
		if (infoLine.slice(0,1) == "\u0023") continue; // Ignore lines prefixed with '#'
		infoLine = infoLine.split(/ *\t */);
		if (!flgHeader) { header = infoLine; flgHeader = true; continue }; // Header
		if (infoLine[0].slice(0,1) == "\u0040") { // '@include'
			var include = infoLine[0].slice(1).replace(/^\s+|\s+$/g, "").replace(/^['"]+|['"]+$/g, "");
			var includeFile = /^default(s?)$/i.test(include) ?
				FindFile(infoFilename, true) : // '@default': include default info file
				File(include); // '@path/to/file.txt': include 'file.txt'
			if (includeFile.path == infoFile.path) continue; // Skip self
			if (includeFile.exists) {
				buffer = ParseInfo(includeFile);
				records = records.concat(buffer.records);
			};
		} else {
			if (!infoLine[0] || !infoLine[2]) errors.push("Line " + line + ": Missing font name.");
			if (!infoLine[1] || !infoLine[3]) errors.push("Line " + line + ": Missing font style.");
			if (app.fonts.item(infoLine[2] + "\t" + infoLine[3]).status !== FontStatus.INSTALLED)
				errors.push("Line " + line + ": Font '" + (infoLine[2] + " " + infoLine[3]).replace(/\t/g, " ") +
					"' is not installed.");
			if (errors.length == 0) records.push([
				infoLine[0] + "\t" + infoLine[1],
				infoLine[2] + "\t" + infoLine[3]
			]);
		};
	};
	infoFile.close(); infoLine = "";
	return { records: records, errors: errors };
};

/**
 * Returns the first occurrence of a data file, first searching for a local one (in the current
 * folder or the parent folder), then a global one (on the desktop or next to the script).
 * @param {string} filename - Filename
 * @param {boolean} [skipLocal] - Don't search locally
 * @returns {File} - File object
 */
function FindFile(filename, skipLocal) {
	var file = "";
	var script = function() { try { return app.activeScript } catch(e) { return new File(e.fileName) } }();
	if (!skipLocal) {
		if (doc.saved && (file = File(app.activeDocument.filePath + "/_" + filename)) && file.exists) return file;
		if (doc.saved && (file = File(app.activeDocument.filePath + "/" + filename)) && file.exists) return file;
		if (doc.saved && (file = File(app.activeDocument.filePath + "/../_" + filename)) && file.exists) return file;
		if (doc.saved && (file = File(app.activeDocument.filePath + "/../" + filename)) && file.exists) return file;
	};
	if ((file = File(Folder.desktop + "/" + filename)) && file.exists) return file;
	if ((file = File(script.path + "/" + filename)) && file.exists) return file;
	if ((file = File(script.path + "/../" + filename)) && file.exists) return file;
};

/**
 * Simple scrollable alert inspired by this snippet by Peter Kahrel:
 * http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250
 * @param {string|string[]} message - Message to be displayed (string or array)
 * @param {string} title - Dialog title
 * @param {boolean} [showFilter] - Shows a filtering field; wildcards: '?' (any char), space and '*' (AND), '|' (OR)
 * @param {boolean} [showCompact] - Sorts message and removes duplicates
 */
function Report(message, title, showFilter, showCompact) {
	if (message instanceof Array) message = message.join("\n"); message = message.split(/\r|\n/g);
	if (showCompact && message.length > 1) {
		message = message.sort();
		for (var i = 1, l = message[0]; i < message.length; l = message[i], i++)
			if (l == message[i] || message[i] == "") { message.splice(i, 1); i-- };
	};
	var w = new Window('dialog', title);
	if (showFilter && message.length > 1) var search = w.add('edittext { characters: 40, \
		helpTip: "Wildcards: \'?\' (any character), space and \'*\' (AND), \'|\' (OR)" }');
	var list = w.add('edittext', undefined, message.join("\n"), { multiline: true, scrolling: true, readonly: true });
	w.add('button { text: "Close", properties: { name: "ok" } }');
	list.characters = function() {
		for (var i = 0, n = message.length, width = 50; i < n;
		width = Math.max(width, message[i].toString().length), i++);
		return width;
	}();
	list.minimumSize.width = 600, list.maximumSize.width = 1024;
	list.minimumSize.height = 100, list.maximumSize.height = 1024;
	w.ok.active = true;
	if (search) {
		search.onChanging = function() {
			if (this.text == "") { list.text = message.join("\n"); w.text = title; return };
			var str = this.text.replace(/[.\[\]{+}]/g, "\\$&"); // Pass through '^*()|?'
			str = str.replace(/\?/g, "."); // '?' -> any character
			if (/[ *]/g.test(str)) str = "(" + str.replace(/ +|\*/g, ").*(") + ")"; // space or '*' -> AND
			str = RegExp(str, "gi");
			for (var i = 0, n = message.length, result = []; i < n; i++) {
				var line = message[i].toString().replace(/^\s+?/g, "");
				if (str.test(line)) result.push(line.replace(/\r|\n/g, "\u00b6").replace(/\t/g, "\\t"));
			};
			w.text = str + " | " + result.length + " record" + (result.length == 1 ? "" : "s");
			if (result.length > 0) { list.text = result.join("\n") } else list.text = "";
		};
	};
	w.show();
};
