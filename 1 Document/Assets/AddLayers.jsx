/*
	Add/merge layers 24.6.16
	(c) 2020-2024 Paul Chiorean <jpeg@basement.ro>

	Adds/merges layers using a 7-column TSV file named `layers.tsv`:

	Name       | Color   | Visible | Printable | Locked | Order | Variants
	dielines   | Magenta | yes     | yes       | yes    | above | cut*, decoupe, die, die*cut, stanz*
	bg         | Red     |         |           |        | below | back, background, bgg, fond, hg, hintergrund*
	.reference | Black   | no      | no        |        | bottom
	...

	<Name>: layer name;
	<Color>: layer color (defaults to Light Blue);
	<Visible>: `yes` or `no` (defaults to `yes`);
	<Printable>: `yes` or `no` (defaults to `yes`);
	<Locked>: `yes` or `no` (defaults to `no`);
	<Order>: `above` or `below` existing layers, or `top`/`bottom` (defaults to `above`);
	<Variants>: a list of layers separated by comma (`,`) that will be merged with the base layer
	(case insensitive; `*` and `?` wildcards accepted).

	The TSV file must be saved locally (in the active document folder or its parent) or as a global
	default (on the desktop, next to the script, or in Indentz root); local files and those starting
	with `_` take precedence. Blank lines are ignored; everything after a `#` (comments) is ignored.
	A line ending in `\` continues on the next line. Use `@defaults` to include the global default,
	or `@include path/to/another.tsv` for other data file. The path can be absolute, or by default
	relative to the data file; a new default path can be set with `@includepath path/to/`.

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

// @includepath '.;./lib;../lib;../../lib';
// @include 'isInArray.jsxinc';
// @include 'parseDataFile.jsxinc';
// @include 'report.jsxinc';
// @include 'unique.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Default layers');

function main() {
	var title = 'Add/merge layers';
	var dataFileName = [ 'layers.tsv', 'layers.txt' ];
	var VERBOSITY = ScriptUI.environment.keyboardState.ctrlKey ? 2 : 1; // 0: only errors, 1: + warnings, 2: + infos
	var file, messages, oldActiveLayer, newLayer, tmpLayer, i, rec;
	var parsed = { header: [], data: [], errors: [] };
	var data = { records: [], status: { info: [], warn: [], error: [] } };
	var counter = { add: 0, merge: 0 };
	var docHasPath = (function () {
		var ret = false;
		try { ret = !!doc.filePath; } catch (e) {}
		return ret;
	}());

	if (!docHasPath && VERBOSITY > 1)
		alert('Can\'t get document path.\nThe default layer substitution list will be used.');

	// Get raw data from TSV
	if (!(file = getDataFile(dataFileName))) { // No data file found
		if (VERBOSITY > 1) {
			alert('Can\'t locate a substitution list \''
				+ (dataFileName.constructor.name === 'Array' ? dataFileName.join('\' or \'') : dataFileName)
				+ '\'.\nThe file must be saved in the current folder, on the desktop, or next to the script. '
				+ 'Check docs for details.');
		}
		exit();
	}
	parsed = parseDataFile(file, dataFileName);
	if (parsed.errors.length > 0) { report(parsed.errors, title); exit(); }

	// Build structured data
	for (i = 0; i < parsed.data.length; i++)
		data.records[i] = checkRecord(parsed.data[i].record);
	if (data.status.error.length > 0) { report(data.status.error, title); exit(); }

	// Processing
	oldActiveLayer = doc.activeLayer; // Save active layer
	doc.layers.everyItem().properties = { locked: false }; // Unlock existing layers

	// Layers above existing layers
	for (i = data.records.length - 1; i >= 0; i--) {
		rec = data.records[i];
		if (rec.order !== 'above' && rec.order !== 'top') continue;
		newLayer = makeLayer(
			rec.name,
			rec.color,
			rec.isVisible,
			rec.isPrintable,
			rec.isLocked,
			rec.variants);
		if (i < data.records.length - 1) {
			tmpLayer = doc.layers.item(data.records[i + 1].name);
			if (tmpLayer.isValid && (newLayer.index > tmpLayer.index)) {
				stat(data.status, rec.source,
					'Moved \'' + newLayer.name + '\' above \'' + tmpLayer.name + '\'.', 0);
				newLayer.move(LocationOptions.BEFORE, tmpLayer);
			}
		}
	}

	// Layers below existing layers
	for (i = 0; i < data.records.length; i++) {
		rec = data.records[i];
		if (rec.order !== 'below' && rec.order !== 'bottom') continue;
		makeLayer(
			rec.name,
			rec.color,
			rec.isVisible,
			rec.isPrintable,
			rec.isLocked,
			rec.variants
		).move(LocationOptions.AT_END);
	}

	// Top layers
	for (i = data.records.length - 1; i >= 0; i--) {
		rec = data.records[i];
		if (rec.order !== 'top') continue;
		if (!(tmpLayer = doc.layers.item(rec.name)).isValid) continue;
		if (tmpLayer.index !== 0) {
			tmpLayer.move(LocationOptions.AT_BEGINNING);
			stat(data.status, rec.source, 'Moved \'' + tmpLayer.name + '\' at top.', 0);
		}
	}

	// Bottom layers
	for (i = 0; i < data.records.length; i++) {
		rec = data.records[i];
		if (rec.order !== 'bottom') continue;
		if (!(tmpLayer = doc.layers.item(rec.name)).isValid) continue;
		if (tmpLayer.index !== (doc.layers.length - 1)) {
			tmpLayer.move(LocationOptions.AT_END);
			stat(data.status, rec.source, 'Moved \'' + tmpLayer.name + '\' at bottom.', 0);
		}
	}

	doc.activeLayer = oldActiveLayer; // Restore active layer

	// Closing up
	if (VERBOSITY > 0) {
		messages = data.status.warn;
		if (VERBOSITY > 1) messages = messages.concat(data.status.info);
		if (messages.length > 0)
			report(messages, 'Layers: ' + counter.add + ' added | ' + counter.merge + ' merged', 'auto');
		else if (VERBOSITY > 1 && (counter.add + counter.merge) === 0) alert('No layers added or merged.');
	}

	function checkRecord(/*array*/record) {
		var tmpData = {};

		tmpData.source = parsed.data[i].source.join(':');
		tmpData.name = record[0];
		tmpData.color = record[1] ? getUIColor(record[1]) : UIColors.LIGHT_BLUE;
		tmpData.isVisible = record[2] ? (record[2].toLowerCase() === 'yes') : true;
		tmpData.isPrintable = record[3] ? (record[3].toLowerCase() === 'yes') : true;
		tmpData.isLocked = record[4] ? (record[4].toLowerCase() === 'yes') : false;
		tmpData.order = record[5] ? record[5].toLowerCase() : 'below';
		tmpData.variants = record[6] ? unique((record[0] + ',' + record[6]).split(/ *, */)) : [ record[0] ];

		if (tmpData.name.length === 0) stat(data.status, tmpData.source + ':1', 'Missing layer name.', -1);

		if (data.status.error.length > 0) return false;
		return tmpData;

		function getUIColor(/*string*/color) {
			return {
				'blue'       : UIColors.BLUE,
				'black'      : UIColors.BLACK,
				'brick red'  : UIColors.BRICK_RED,
				'brown'      : UIColors.BROWN,
				'burgundy'   : UIColors.BURGUNDY,
				'charcoal'   : UIColors.CHARCOAL,
				'cute teal'  : UIColors.CUTE_TEAL,
				'cyan'       : UIColors.CYAN,
				'dark blue'  : UIColors.DARK_BLUE,
				'dark green' : UIColors.DARK_GREEN,
				'fiesta'     : UIColors.FIESTA,
				'gold'       : UIColors.GOLD,
				'grass green': UIColors.GRASS_GREEN,
				'gray'       : UIColors.GRAY,
				'green'      : UIColors.GREEN,
				'grid blue'  : UIColors.GRID_BLUE,
				'grid green' : UIColors.GRID_GREEN,
				'grid orange': UIColors.GRID_ORANGE,
				'lavender'   : UIColors.LAVENDER,
				'light blue' : UIColors.LIGHT_BLUE,
				'light gray' : UIColors.LIGHT_GRAY,
				'light olive': UIColors.LIGHT_OLIVE,
				'lipstick'   : UIColors.LIPSTICK,
				'magenta'    : UIColors.MAGENTA,
				'ochre'      : UIColors.OCHRE,
				'olive green': UIColors.OLIVE_GREEN,
				'orange'     : UIColors.ORANGE,
				'peach'      : UIColors.PEACH,
				'pink'       : UIColors.PINK,
				'purple'     : UIColors.PURPLE,
				'red'        : UIColors.RED,
				'sulphur'    : UIColors.SULPHUR,
				'tan'        : UIColors.TAN,
				'teal'       : UIColors.TEAL,
				'violet'     : UIColors.VIOLET,
				'white'      : UIColors.WHITE,
				'yellow'     : UIColors.YELLOW
			}[color.toLowerCase()] || UIColors.LIGHT_BLUE;
		}
	}

	function makeLayer(name, color, isVisible, isPrintable, isLocked, variants) {
		var targetLayer, l, oldName, layers, oldLayerVisibility;
		targetLayer = doc.layers.item(name);
		if (targetLayer.isValid) {
			targetLayer.properties = {
				layerColor: color,
				visible:    isVisible,
				printable:  isPrintable,
				locked:     isLocked
			};
		} else {
			doc.activeLayer = doc.layers.firstItem();
			targetLayer = doc.layers.add({
				name:       name,
				layerColor: color,
				visible:    isVisible,
				printable:  isPrintable,
				locked:     isLocked
			});
			counter.add++;
			stat(data.status, rec.source, 'Added \'' + targetLayer.name + '\'.', 0);
		}
		// Merge variants
		layers = doc.layers.everyItem().getElements();
		while ((l = layers.shift())) {
			if (l.name !== variants[0] && isInArray(l.name, variants)) {
				oldLayerVisibility = l.visible;
				if (l === oldActiveLayer) oldActiveLayer = targetLayer;
				oldName = l.name;
				targetLayer.merge(l);
				targetLayer.visible = oldLayerVisibility;
				if (oldName !== targetLayer.name) {
					counter.merge++;
					stat(data.status, rec.source,
						'Merged \'' + oldName + '\' with \'' + targetLayer.name + '\'.', 0);
				}
			}
		}
		return targetLayer;
	}
}
