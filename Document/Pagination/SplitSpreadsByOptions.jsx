/*
	Split/join spreads by options 25.3.9
	(c) 2025 Paul Chiorean <jpeg@basement.ro>

	Splits or joins document spreads by option-specific layers.

	Add a colon in the layer name to specify the option, using the format:
	'<layer name>: <option>'. For example, 'copy: de_CH'.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @includepath '.;./lib;../lib;../../lib';
// @include 'getPageItems.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Split/join spreads by options');

function main() {
	var item, layer, option, i, k, l;
	var items = [];
	var optionRE = /^.*:\s*(.+)\s*$/; // Match layers containing ':<option>'
	var optionLayers = {};
	var optionNames = [];

	app.scriptPreferences.enableRedraw = false;

	// Build a list of options
	for (i = 0; i < doc.layers.length; i++) {
		layer = doc.layers[i];
		if (optionRE.test(layer.name))
			optionLayers[layer.name.match(optionRE)[1]] = [];
	}
	for (var key in optionLayers)
		if (Object.prototype.hasOwnProperty.call(optionLayers, key)) optionNames.push(key);
	if (optionNames.length === 0) exit();

	// Build a list of corresponding layers
	for (i = 0; i < doc.layers.length; i++) {
		layer = doc.layers[i];
		if (optionRE.test(layer.name))
			optionLayers[layer.name.match(optionRE)[1]].push(layer);
	}

	// If we have one spread, split it by options
	if (doc.spreads.length === 1 && optionNames.length > 1) {
		// Duplicate the first spread
		for (i = 1; i < optionNames.length; i++) doc.spreads[0].duplicate(LocationOptions.AT_END);

		// For each spread, keep the corresponding option and delete others
		for (i = 0; i < doc.spreads.length; i++) {
			for (k = 0; k < optionNames.length; k++) {
				option = optionNames[k];
				if (k === i) continue; // Skip self

				for (l = 0; l < optionLayers[option].length; l++) {
					layer = optionLayers[option][l];
					items = getPageItems('<*>', doc.spreads[i], layer.name);
					if (items.length === 0) continue; // Skip empty layers
					while ((item = items.shift())) try { item.remove(); } catch (_) {}
				}
			}
		}

	// If we have multiple spreads, combine them:
	// Get each layer's parent spread and move items to the first spread
	} else if (doc.spreads.length <= optionNames.length) {
		for (k = 0; k < optionNames.length; k++) {
			option = optionNames[k];

			for (l = 0; l < optionLayers[option].length; l++) {
				layer = optionLayers[option][l];
				items = getPageItems('<*>', doc, layer.name);
				if (items.length === 0) continue; // Skip empty layers
				items = getPageItems('<*>', items[0].parentPage.parent, layer.name);
				while ((item = items.shift())) {
					try {
						item.duplicate(doc.spreads[0]);
						item.remove();
					} catch (_) {}
				}
			}
		}
		doc.spreads.itemByRange(1, doc.spreads.length - 1).remove(); // Remove obsolete spreads
	} else if (optionNames.length > 0) {
		alert('Source/destination mismatch'
			+ '\nSource: ' + doc.spreads.length + ' spreads.'
			+ '\nDestination: \'' + optionNames.join('\', \'')
			+ '\' (' + optionNames.length + ' options).'
		);
	}
}
