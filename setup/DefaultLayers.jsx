/*
	Default layers v2.1.1 (2021-05-28)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Adds/merges layers from a 6-column TSV file named "layers.txt":

	Name     | Color   | Visible | Printable | Order | Variants
	dielines | Magenta | yes     | yes       | top   | cut*, decoupe, die, die*cut, stanz*
	template | Gray    | no      | no        | below
	...
	1. <Name>: layer name,
	2. <Color>: layer color (see UIColors.txt; default "Light Blue"),
	3. <Visible>: "yes" or "no" (default "yes"),
	4. <Printable>: "yes" or "no" (default "yes"),
	5. <Order>: "above" or "below" existing layers (default "above"),
	6. <Variants>: a list of layers that will be merged with the base layer (case insensitive).

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
if (!(infoFile = TSVFile("layers.txt"))) { alert("File 'layers.txt' not found."); exit() }

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Default layers");


function main() {
	infoFile.open("r");
	var infoLine, header, data = [],
		line = 0, flgHeader = false,
		errors = [], errln;
	while (!infoFile.eof) {
		infoLine = infoFile.readln(); line++;
		if (infoLine == "") continue; // Skip empty lines
		if (infoLine.toString().slice(0,1) == "\u0023") continue; // Skip lines beginning with '#'
		infoLine = infoLine.split(/ *\t */);
		if (!flgHeader) { header = infoLine; flgHeader = true; continue } // 1st line is header
		errln = "Line " + line + ": ";
		if (!infoLine[0]) errors.push(errln + "Missing layer name.");
		if (errors.length == 0) data.push({
			name: infoLine[0],
			color: !!infoLine[1] ? GetUIColor(infoLine[1]) : UIColors.LIGHT_BLUE,
			isVisible: !!infoLine[2] ? (infoLine[2].toLowerCase() == "yes") : true,
			isPrintable: !!infoLine[3] ? (infoLine[3].toLowerCase() == "yes") : true,
			isBelow: !!infoLine[4] ? (infoLine[4].toLowerCase() == "below") : false,
			variants: !!infoLine[5] ? (infoLine[0] + "," + infoLine[5]).split(/ *, */) : ""
		});
	}
	infoFile.close(); infoLine = "";
	if (errors.length > 0) {
		AlertScroll(infoFile.getRelativeURI(doc.filePath), errors.join("\n")); exit() }
	if (data.length < 1) exit();

	doc.layers.everyItem().properties = { locked: false } // Unlock existing layers
	var oldAL = doc.activeLayer; // Save active layer
	// Top layers
	for (var i = data.length - 1; i >= 0 ; i--) {
		if (data[i].isBelow) continue;
		var layer = MakeLayer(
			data[i].name,
			data[i].color,
			data[i].isVisible,
			data[i].isPrintable,
			data[i].variants);
		if (i < data.length - 1) {
			var tmpLayer = doc.layers.item(data[i+1].name);
			if (tmpLayer.isValid && (layer.index > tmpLayer.index))
				layer.move(LocationOptions.BEFORE,doc.layers.item(data[i+1].name));
		}
	}
	// Bottom layers
	for (var i = 0; i < data.length; i++) {
		if (!data[i].isBelow) continue;
		var layer = MakeLayer(
			data[i].name,
			data[i].color,
			data[i].isVisible,
			data[i].isPrintable,
			data[i].variants)
		.move(LocationOptions.AT_END);
	}
	doc.activeLayer = oldAL; // Restore active layer

	function MakeLayer(name, color, isVisible, isPrintable, variants) {
		var layer = doc.layers.item(name);
		if (layer.isValid)
			layer.properties = {
				layerColor: color,
				// visible: isVisible,
				printable: isPrintable
			}
		else {
			doc.activeLayer = doc.layers.firstItem();
			doc.layers.add({
				name: name,
				layerColor: color,
				visible: isVisible,
				printable: isPrintable
			});
		}
		// Merge variants
		var l, layers = doc.layers.everyItem().getElements();
		while (l = layers.shift())
			if (isIn(l.name, variants, false)) {
				if (layer.name == l.name) continue;
				var oldLV = l.visible;
				if (l == oldAL) oldAL = layer;
				layer.merge(l);
				layer.visible = oldLV;
			};
		return layer;
	}

	// Modified from FORWARD.Util functions, by Richard Harrington
	// https://github.com/richardharrington/indesign-scripts
	function isIn(searchValue, array, caseSensitive) {
		caseSensitive = (typeof caseSensitive !== 'undefined') ? caseSensitive : true;
		var item;
		if (!caseSensitive && typeof searchValue === 'string') searchValue = searchValue.toLowerCase();
		for (var i = 0; i < array.length; i++) {
			item = array[i];
			if (!caseSensitive && typeof item === 'string') item = item.toLowerCase();
			// if (item === searchValue) return true;
			item = RegExp("^" + item.replace(/\*/g, ".*").replace(/\?/g, ".") + "$", "g");
			if (item.test(searchValue)) return true;
		}
	}
}

function TSVFile(fn) {
	var file = "";
	if (doc.saved && (file = File(app.activeDocument.filePath + "/_" + fn)) && file.exists) return file;
	if (doc.saved && (file = File(app.activeDocument.filePath + "/" + fn)) && file.exists) return file;
	if ((file = File(Folder.desktop + "/" + fn)) && file.exists) return file;
	if ((file = File(app.activeScript.path + "/" + fn)) && file.exists) return file;
	if ((file = File(app.activeScript.path + "/../" + fn)) && file.exists) return file;
}

function GetUIColor(color) {
	return {
		'Blue': UIColors.BLUE,
		'Black': UIColors.BLACK,
		'Brick Red': UIColors.BRICK_RED,
		'Brown': UIColors.BROWN,
		'Burgundy': UIColors.BURGUNDY,
		'Charcoal': UIColors.CHARCOAL,
		'Cute Teal': UIColors.CUTE_TEAL,
		'Cyan': UIColors.CYAN,
		'Dark Blue': UIColors.DARK_BLUE,
		'Dark Green': UIColors.DARK_GREEN,
		'Fiesta': UIColors.FIESTA,
		'Gold': UIColors.GOLD,
		'Grass Green': UIColors.GRASS_GREEN,
		'Gray': UIColors.GRAY,
		'Green': UIColors.GREEN,
		'Grid Blue': UIColors.GRID_BLUE,
		'Grid Green': UIColors.GRID_GREEN,
		'Grid Orange': UIColors.GRID_ORANGE,
		'Lavender': UIColors.LAVENDER,
		'Light Blue': UIColors.LIGHT_BLUE,
		'Light Gray': UIColors.LIGHT_GRAY,
		'Light Olive': UIColors.LIGHT_OLIVE,
		'Lipstick': UIColors.LIPSTICK,
		'Magenta': UIColors.MAGENTA,
		'Ochre': UIColors.OCHRE,
		'Olive Green': UIColors.OLIVE_GREEN,
		'Orange': UIColors.ORANGE,
		'Peach': UIColors.PEACH,
		'Pink': UIColors.PINK,
		'Purple': UIColors.PURPLE,
		'Red': UIColors.RED,
		'Sulphur': UIColors.SULPHUR,
		'Tan': UIColors.TAN,
		'Teal': UIColors.TEAL,
		'Violet': UIColors.VIOLET,
		'White': UIColors.WHITE,
		'Yellow': UIColors.YELLOW
	}[color] || UIColors.LIGHT_BLUE;
}

// Modified from 'Scrollable alert' by Peter Kahrel
// http://forums.adobe.com/message/2869250#2869250
function AlertScroll(title, msg, /*bool*/filter) {
	if (msg instanceof Array) msg = msg.join("\n");
	var msgArray = msg.split(/\r|\n/g);
	var w = new Window("dialog", title);
	if (filter) var search = w.add("edittext { characters: 40 }");
	var list = w.add("edittext", undefined, msg, { multiline: true, scrolling: true, readonly: true });
	list.characters = (function() {
		for (var i = 0, width = 50; i < msgArray.length; i++) width = Math.max(width, msgArray[i].length);
		return width;
	})();
	list.minimumSize.width = 100; list.maximumSize.width = 1024;
	list.minimumSize.height = 100; list.maximumSize.height = 1024;
	w.add("button", undefined, "Close", { name: "ok" });
	w.ok.active = true;
	if (filter) search.onChanging = function() {
		var result = [];
		for (var i = 0; i < msgArray.length; i++)
			if (msgArray[i].toLowerCase().indexOf((this.text).toLowerCase()) != -1) result.push(msgArray[i]);
		if (result.length > 0) list.text = result.join("\n")
		else list.text = "Nothing found."
	};
	w.show();
};
