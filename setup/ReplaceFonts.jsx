/*
	Replace fonts 1.16 (2021-06-07)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Replaces fonts from a 4-column TSV file named "fonts.txt":

	Old font | Style   | New font       | Style
	Arial    | Regular | Helvetica Neue | Regular
	Arial    | Bold    | Helvetica Neue | Bold
	...

	The file can be saved in the current folder, on the desktop, or next to the script.
	Blank lines and those prefixed with "#" are ignored.

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
if (!(infoFile = TSVFile("fonts.txt"))) { alert("File 'fonts.txt' not found."); exit() }

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Replace fonts");


function main() {
	infoFile.open("r");
	var infoLine, header, data = [],
		line = 0, flgHeader = false,
		errors = [];
	while (!infoFile.eof) {
		infoLine = infoFile.readln(); line++;
		if (infoLine.replace(/^\s+|\s+$/g, "") == "") continue; // Skip empty lines
		if (infoLine.toString().slice(0,1) == "\u0023") continue; // Skip lines beginning with '#'
		infoLine = infoLine.split(/ *\t */);
		if (!flgHeader) { header = infoLine; flgHeader = true; continue } // 1st line is header
		if (!infoLine[0] || !infoLine[2]) errors.push("Line " + line + ": Missing font name.");
		if (!infoLine[1] || !infoLine[3]) errors.push("Line " + line + ": Missing font style.");
		if (errors.length == 0) data.push([
			infoLine[0] + "\t" + infoLine[1],
			infoLine[2] + "\t" + infoLine[3]
		]);
	}
	infoFile.close(); infoLine = "";
	if (errors.length > 0) {
		Report(errors.join("\n"), infoFile.getRelativeURI(doc.filePath)); exit() }
	if (data.length < 1) exit();

	for (var i = 0; i < data.length; i++) {
		app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
		app.findChangeTextOptions.includeHiddenLayers = true;
		app.findChangeTextOptions.includeLockedLayersForFind = true;
		app.findChangeTextOptions.includeLockedStoriesForFind = true;
		app.findChangeTextOptions.includeMasterPages = true;
		app.findTextPreferences.appliedFont = data[i][0];
		app.changeTextPreferences.appliedFont = data[i][1];
		doc.changeText();
	}
	app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
}

function TSVFile(fn) {
	var file = "";
	if (doc.saved && (file = File(app.activeDocument.filePath + "/_" + fn)) && file.exists) return file;
	if (doc.saved && (file = File(app.activeDocument.filePath + "/" + fn)) && file.exists) return file;
	if ((file = File(Folder.desktop + "/" + fn)) && file.exists) return file;
	if ((file = File(app.activeScript.path + "/" + fn)) && file.exists) return file;
	if ((file = File(app.activeScript.path + "/../" + fn)) && file.exists) return file;
}

// Inspired by this scrollable alert by Peter Kahrel:
// http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250
function Report(msg, title, /*bool*/filter, /*bool*/compact) {
	if (msg instanceof Array) msg = msg.join("\n"); msg = msg.split(/\r|\n/g);
	if (compact && msg.length > 1) {
		msg = msg.sort();
		for (var i = 1, l = msg[0]; i < msg.length; l = msg[i], i++)
			if (l == msg[i] || msg[i] == "") msg.splice(i, 1)
	};
	var w = new Window('dialog', title);
	if (filter && msg.length > 1) var search = w.add('edittext { characters: 40, \
		helpTip: "Special operators: \'?\' (any character), space and \'*\' (and), \'|\' (or)" }');
	var list = w.add('edittext', undefined, msg.join("\n"), { multiline: true, scrolling: true, readonly: true });
	w.add('button { text: "Close", properties: { name: "ok" } }');
	list.characters = (function() {
		for (var i = 0, width = 50; i < msg.length;
		width = Math.max(width, msg[i].toString().length), i++);
		return width;
	})();
	list.minimumSize.width = 600, list.maximumSize.width = 1024;
	list.minimumSize.height = 100, list.maximumSize.height = 1024;
	w.ok.active = true;
	if (filter && msg.length > 1) {
		search.onChanging = function() {
			if (this.text == "") { list.text = msg.join("\n"); w.text = title; return };
			var str = this.text.replace(/[.\[\]{+}]/g, "\\$&"); // Pass through '^*()|?'
			str = str.replace(/\?/g, "."); // '?' -> any character
			if (/[ *]/g.test(str)) str = "(" + str.replace(/ +|\*/g, ").*(") + ")"; // space or '*' -> AND
			str = RegExp(str, "gi");
			for (var i = 0, result = []; i < msg.length; i++) {
				var line = msg[i].toString().replace(/^\s+?/g, "");
				if (str.test(line)) result.push(line.replace(/\r|\n/g, "\u00b6").replace(/\t/g, "\\t"));
			};
			w.text = str + " | " + result.length + " record" + (result.length == 1 ? "" : "s");
			if (result.length > 0) { list.text = result.join("\n") } else list.text = "";
		};
	};
	w.show();
};
