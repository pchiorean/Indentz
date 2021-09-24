/*
	Default layers v3.1.7 (2021-09-24)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Adds/merges layers from a 6-column TSV file named 'layers.txt':

	Name     | Color   | Visible | Printable | Order | Variants
	dielines | Magenta | yes     | yes       | top   | cut*, decoupe, die, die*cut, stanz*
	template | Gray    | no      | no        | below
	...
	1. <Name>: layer name
	2. <Color>: layer color (see UIColors.txt; default 'Light Blue')
	3. <Visible>: 'yes' or 'no' (default 'yes')
	4. <Printable>: 'yes' or 'no' (default 'yes')
	5. <Order>: 'above' or 'below' existing layers (default 'above')
	6. <Variants>: a list of layers that will be merged with the base layer
	   (case insensitive; '*' and '?' wildcards accepted)

	The file can be saved in the current folder, on the desktop, or next to the script.
	Blank lines and those prefixed with '#' are ignored; '@file.txt' includes records from 'file.txt'.

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

/* eslint-disable max-statements-per-line */

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Default layers');

function main() {
	var newLayer, tmpLayer, i, n;
	var oldActiveLayer = doc.activeLayer; // Save active layer
	var dataFile = getDataFile('layers.txt');
	if (!dataFile) { alert('No data file found.'); exit(); }
	var data = parseInfo(dataFile);
	if (data.errors.length > 0) { report(data.errors, decodeURI(dataFile.getRelativeURI(doc.filePath))); exit(); }
	if (data.records.length === 0) exit();

	doc.layers.everyItem().properties = { locked: false }; // Unlock existing layers
	// Top layers
	for (i = data.records.length - 1; i >= 0 ; i--) {
		if (data.records[i].isBelow) continue;
		newLayer = makeLayer(
			data.records[i].name,
			data.records[i].color,
			data.records[i].isVisible,
			data.records[i].isPrintable,
			data.records[i].variants);
		if (i < data.records.length - 1) {
			tmpLayer = doc.layers.item(data.records[i + 1].name);
			if (tmpLayer.isValid && (newLayer.index > tmpLayer.index))
				newLayer.move(LocationOptions.BEFORE,doc.layers.item(data.records[i + 1].name));
		}
	}
	// Bottom layers
	for (i = 0, n = data.records.length; i < n; i++) {
		if (!data.records[i].isBelow) continue;
		makeLayer(
			data.records[i].name,
			data.records[i].color,
			data.records[i].isVisible,
			data.records[i].isPrintable,
			data.records[i].variants)
		.move(LocationOptions.AT_END);
	}
	doc.activeLayer = oldActiveLayer; // Restore active layer

	function makeLayer(name, color, isVisible, isPrintable, variants) {
		var targetLayer, docLayers, candidateLayer, oldLayerVisibility;
		targetLayer = doc.layers.item(name);
		if (targetLayer.isValid) {
			targetLayer.properties = {
				layerColor: color,
				// visible:    isVisible,
				printable:  isPrintable
			};
		} else {
			doc.activeLayer = doc.layers.firstItem();
			doc.layers.add({
				name:       name,
				layerColor: color,
				visible:    isVisible,
				printable:  isPrintable
			});
		}
		// Merge variants
		docLayers = doc.layers.everyItem().getElements();
		while ((candidateLayer = docLayers.shift())) {
			if (candidateLayer === targetLayer) continue;
			if (isIn(candidateLayer.name, variants, false)) {
				oldLayerVisibility = candidateLayer.visible;
				if (candidateLayer === oldActiveLayer) oldActiveLayer = targetLayer;
				targetLayer.merge(candidateLayer);
				targetLayer.visible = oldLayerVisibility;
			}
		}
		return targetLayer;

		// Modified from FORWARD.Util functions, by Richard Harrington
		// https://github.com/richardharrington/indesign-scripts
		function isIn(searchValue, array, caseSensitive) {
			var item;
			caseSensitive = (caseSensitive === undefined) ? true : caseSensitive;
			if (!caseSensitive && typeof searchValue === 'string') searchValue = searchValue.toLowerCase();
			for (var i = 0, n = array.length; i < n; i++) {
				item = array[i];
				if (!caseSensitive && typeof item === 'string') item = item.toLowerCase();
				// if (item === searchValue) return true;
				item = RegExp('^' + item.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'g');
				if (item.test(searchValue)) return true;
			}
			return false;
		}
	}
}

/**
 * Returns the first occurrence of a data file, first searching for a local one (in the current
 * folder or the parent folder), then a global one (on the desktop or next to the script).
 * @param {String} filename - Filename
 * @param {Boolean} [skipLocal] - Don't search locally
 * @returns {File|void} - Found file object or undefined
 */
function getDataFile(filename, skipLocal) {
	var file = '';
	var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());
	if (!skipLocal) {
		if (doc.saved && (file = File(app.activeDocument.filePath + '/_'    + filename)) && file.exists) return file;
		if (doc.saved && (file = File(app.activeDocument.filePath + '/'     + filename)) && file.exists) return file;
		if (doc.saved && (file = File(app.activeDocument.filePath + '/../_' + filename)) && file.exists) return file;
		if (doc.saved && (file = File(app.activeDocument.filePath + '/../'  + filename)) && file.exists) return file;
	}
	if ((file = File(Folder.desktop + '/'    + filename)) && file.exists) return file;
	if ((file = File(script.path    + '/'    + filename)) && file.exists) return file;
	if ((file = File(script.path    + '/../' + filename)) && file.exists) return file;
	return undefined;
}

/**
 * Parses a TSV file, returning an object containing found records and errors. Ignores blank lines and those prefixed
 * with '#'; '@path/to/file.txt' includes records from 'file.txt', '@default' includes the default data file.
 * @param {File} dataFile - Tab-separated-values file object
 * @returns {{records: Array, errors: Array}}
 */
function parseInfo(dataFile) {
	var infoLine, include, includeFile;
	var buffer = [];
	var records = [];
	var errors = [];
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
			includeFile = /^default(s?)$/i.test(include) ?                   // '@default' ?
				getDataFile(decodeURI(dataFile.name).replace(/^_/, ''), true) : // include default data file :
				File(include);                                               // include 'path/to/file.txt'
			if (includeFile && includeFile.exists) {
				if (includeFile.fullName === dataFile.fullName) continue; // Skip self
				buffer = parseInfo(includeFile);
				records = records.concat(buffer.records);
			}
		} else {
			if (!infoLine[0]) errors.push('Line ' + line + ': Missing layer name.');
			if (errors.length === 0) {
				records.push({
					name:        infoLine[0],
					color:       infoLine[1] ? getUIColor(infoLine[1]) : UIColors.LIGHT_BLUE,
					isVisible:   infoLine[2] ? (infoLine[2].toLowerCase() === 'yes')   : true,
					isPrintable: infoLine[3] ? (infoLine[3].toLowerCase() === 'yes')   : true,
					isBelow:     infoLine[4] ? (infoLine[4].toLowerCase() === 'below') : false,
					variants:    infoLine[5] ? (infoLine[0] + ',' + infoLine[5]).split(/ *, */) : ''
				});
			}
		}
	}
	dataFile.close(); infoLine = '';
	return { records: records, errors: errors };

	function getUIColor(color) {
		return {
			'Blue':        UIColors.BLUE,
			'Black':       UIColors.BLACK,
			'Brick Red':   UIColors.BRICK_RED,
			'Brown':       UIColors.BROWN,
			'Burgundy':    UIColors.BURGUNDY,
			'Charcoal':    UIColors.CHARCOAL,
			'Cute Teal':   UIColors.CUTE_TEAL,
			'Cyan':        UIColors.CYAN,
			'Dark Blue':   UIColors.DARK_BLUE,
			'Dark Green':  UIColors.DARK_GREEN,
			'Fiesta':      UIColors.FIESTA,
			'Gold':        UIColors.GOLD,
			'Grass Green': UIColors.GRASS_GREEN,
			'Gray':        UIColors.GRAY,
			'Green':       UIColors.GREEN,
			'Grid Blue':   UIColors.GRID_BLUE,
			'Grid Green':  UIColors.GRID_GREEN,
			'Grid Orange': UIColors.GRID_ORANGE,
			'Lavender':    UIColors.LAVENDER,
			'Light Blue':  UIColors.LIGHT_BLUE,
			'Light Gray':  UIColors.LIGHT_GRAY,
			'Light Olive': UIColors.LIGHT_OLIVE,
			'Lipstick':    UIColors.LIPSTICK,
			'Magenta':     UIColors.MAGENTA,
			'Ochre':       UIColors.OCHRE,
			'Olive Green': UIColors.OLIVE_GREEN,
			'Orange':      UIColors.ORANGE,
			'Peach':       UIColors.PEACH,
			'Pink':        UIColors.PINK,
			'Purple':      UIColors.PURPLE,
			'Red':         UIColors.RED,
			'Sulphur':     UIColors.SULPHUR,
			'Tan':         UIColors.TAN,
			'Teal':        UIColors.TEAL,
			'Violet':      UIColors.VIOLET,
			'White':       UIColors.WHITE,
			'Yellow':      UIColors.YELLOW
		}[color] || UIColors.LIGHT_BLUE;
	}
}

/**
 * Simple scrollable alert inspired by this snippet by Peter Kahrel:
 * http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250
 * @param {String|String[]} message - Message to be displayed (string or array)
 * @param {String} title - Dialog title
 * @param {Boolean} [showFilter] - Shows a filtering field; wildcards: '?' (any char), space and '*' (AND), '|' (OR)
 * @param {Boolean} [showCompact] - Sorts message and removes duplicates
 */
function report(message, title, showFilter, showCompact) {
	var search, list;
	var w = new Window('dialog', title);
	// Convert message to array
	if (message.constructor.name !== 'Array') message = message.split(/\r|\n/g);
	if (showCompact && message.length > 1) { // Sort and remove duplicates
		message = message.sort();
		for (var i = 1, l = message[0]; i < message.length; l = message[i], i++) {
			if (l === message[i]) { message.splice(i, 1); i--; }
			if (message[i] === '') { message.splice(i, 1); i--; }
		}
	}
	if (showFilter && message.length > 1) { // Add a filtering field
		search = w.add('edittext { characters: 40, helpTip: "Wildcards: \'?\' (any character), space and \'*\' (AND), \'|\' (OR)" }');
		search.onChanging = function () {
			var str, line, i, n;
			var result = [];
			if (this.text === '') {
				list.text = message.join('\n'); w.text = title; return;
			}
			str = this.text.replace(/[.[\]{+}]/g, '\\$&'); // Pass through '^*()|?'
			str = str.replace(/\?/g, '.'); // '?' -> any character
			if (/[ *]/g.test(str)) str = '(' + str.replace(/ +|\*/g, ').*(') + ')'; // space or '*' -> AND
			str = RegExp(str, 'gi');
			for (i = 0, n = message.length; i < n; i++) {
				line = message[i].toString().replace(/^\s+?/g, '');
				if (str.test(line)) result.push(line.replace(/\r|\n/g, '\u00b6').replace(/\t/g, '\\t'));
			}
			w.text = str + ' | ' + result.length + ' record' + (result.length === 1 ? '' : 's');
			if (result.length > 0) list.text = result.join('\n'); else list.text = '';
		};
	}
	list = w.add('edittext', undefined, message.join('\n'), { multiline: true, scrolling: true, readonly: true });
	list.characters = (function () {
		var width = 50;
		for (var i = 0, n = message.length; i < n; width = Math.max(width, message[i].toString().length), i++);
		return width;
	}());
	list.minimumSize.width  = 600; list.maximumSize.width  = 1024;
	list.minimumSize.height = 100; list.maximumSize.height = 1024;
	w.add('button { text: "Close", properties: { name: "ok" } }');
	w.ok.active = true;
	w.show();
}
