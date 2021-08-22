/*
	Default swatches v4.3 (2021-08-22)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Adds swatches from a 5-column TSV file named "swatches.txt":

	Name       | Color Model | Color Space | Values       | Variants
	Rich Black | process     | cmyk        | 60 40 40 100 |
	RGB Grey   | process     | rgb         | 128 128 128  |
	Cut        | spot        | cmyk        | 0 100 0 0    | couper, diecut
	...
	1. <Name>: swatch name
	2. <Color Model>: "process" or "spot" (default "process")
	3. <Color Space>: "cmyk", "rgb" or "lab" (default "cmyk")
	4. <Values>: 3 values in 0–255 range for RGB,
	   4 values in 0–100 range for CMYK,
	   3 values in 0–100 (L), -128–127 (A and B) range for Lab
	5. <Variants>: a list of swatches that will be replaced by the base swatch
	   (case insensitive; '*' and '?' wildcards accepted)

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

var infoFile, infoFilename = "swatches.txt";
if (!(infoFile = FindFile(infoFilename))) { alert("File '" + infoFilename + "' not found."); exit() };

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Default swatches");

function main() {
	var data = ParseInfo(infoFile);
	if (data.errors.length > 0) { Report(data.errors, decodeURI(infoFile.getRelativeURI(doc.filePath))); exit() };
	if (data.records.length == 0) exit();

	for (var i = 0, n = data.records.length; i < n; i++) {
		AddSwatch(
			data.records[i].name,
			data.records[i].model,
			data.records[i].space,
			data.records[i].values,
			data.records[i].variants
		);
	};

	function AddSwatch(name, model, space, values, variants) {
		var color = doc.colors.itemByName(name);
		if (!color.isValid) color = doc.colors.add({
			name: name,
			model: model || ColorModel.PROCESS,
			space: space || ColorSpace.CMYK,
			colorValue: values
		});
		// Merge variants
		if (variants.length > 0) {
			var c, colors = doc.colors.everyItem().getElements();
			while (c = colors.shift()) {
				if (c == color) continue;
				if (IsIn(c.name, variants)) try { c.remove(color) } catch (e) {};
			};
		};
		return color;
	};

	function IsIn(searchValue, array) {
		for (var i = 0, n = array.length; i < n; i++) {
			var item = RegExp("^" + array[i].replace(/\*/g, ".*").replace(/\?/g, ".") + "$", "ig");
			if (item.test(searchValue)) return true;
		};
		return false;
	};
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
			if (includeFile.fullName == infoFile.fullName) continue; // Skip self
			if (includeFile.exists) {
				buffer = ParseInfo(includeFile);
				records = records.concat(buffer.records);
			};
		} else {
			if (!infoLine[0]) errors.push("Line " + line + ": Missing swatch name.");
			if (errors.length == 0) records.push({
				name: infoLine[0],
				model: (function (string) { return {
					"process": ColorModel.PROCESS,
					"spot": ColorModel.SPOT
				}[string] || ColorModel.PROCESS })(infoLine[1]),
				space: (function (string) { return {
					"cmyk": ColorSpace.CMYK,
					"rgb": ColorSpace.RGB,
					"lab": ColorSpace.LAB
				}[string] || ColorSpace.CMYK })(infoLine[2]),
				values: (function (array) {
					var values = [], c;
					array = /[\,\|]/.test(array) ? array.split(/ *[\,\|] */) : array.split(/ +/);
					while (c = array.shift()) values.push(Number(c));
					return values;
				})(infoLine[3]),
				variants: !!infoLine[4] ? infoLine[4].split(/ *, */) : ""
			});
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
		if (doc.saved && (file = File(app.activeDocument.filePath + "/_"    + filename)) && file.exists) return file;
		if (doc.saved && (file = File(app.activeDocument.filePath + "/"     + filename)) && file.exists) return file;
		if (doc.saved && (file = File(app.activeDocument.filePath + "/../_" + filename)) && file.exists) return file;
		if (doc.saved && (file = File(app.activeDocument.filePath + "/../"  + filename)) && file.exists) return file;
	};
	if ((file = File(Folder.desktop + "/"    + filename)) && file.exists) return file;
	if ((file = File(script.path    + "/"    + filename)) && file.exists) return file;
	if ((file = File(script.path    + "/../" + filename)) && file.exists) return file;
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
	list.minimumSize.width  = 600, list.maximumSize.width  = 1024;
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
