/*
	Split/join spreads by options 25.7.14
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
	var optionVisibility = {};

	app.scriptPreferences.enableRedraw = false;

	// Build a list of options
	for (i = 0; i < doc.layers.length; i++) {
		layer = doc.layers[i];
		if (optionRE.test(layer.name)) {
			optionLayers[layer.name.match(optionRE)[1]] = [];
			optionVisibility[layer.name.match(optionRE)[1]] = true;
		}
	}
	for (var key in optionLayers) if (Object.prototype.hasOwnProperty.call(optionLayers, key)) optionNames.push(key);
	if (optionNames.length === 0) exit(); // Exit if no option-specific layers exist

	// Build a list of corresponding layers
	for (i = 0; i < doc.layers.length; i++) {
		layer = doc.layers[i];
		if (optionRE.test(layer.name)) optionLayers[layer.name.match(optionRE)[1]].push(layer);
	}

	// 1. If we have one spread, split it by options
	// - Duplicate the first spread
	// - For each spread, keep the corresponding option and delete others
	// - Delete optionless spreads
	if (doc.spreads.length === 1 && optionNames.length > 1) {
		for (i = 1; i < optionNames.length; i++) doc.spreads[0].duplicate(LocationOptions.AT_END);

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

		for (i = 0; i < doc.spreads.length; i++) {
			for (k = 0; k < optionNames.length; k++) {
				option = optionNames[k];
				if (k !== i) continue; // Skip self
				for (l = 0; l < optionLayers[option].length; l++) {
					layer = optionLayers[option][l];
					items = getPageItems('<*>', doc.spreads[i], layer.name);
					optionVisibility[option] = optionVisibility[option] && (items.length > 0);
				}
			}
		}
		for (i = 0; i < doc.spreads.length; i++)
			if (!optionVisibility[optionNames[i]]) try { doc.spreads[i].remove(); } catch (_) {}

	// 2. If we have multiple spreads, combine them:
	// - Get each option-specific layer's parent spread and move items to the first spread
	// - Delete obsolete spreads
	} else if (doc.spreads.length <= optionNames.length) {
		for (k = 0; k < optionNames.length; k++) {
			option = optionNames[k];
			for (l = 0; l < optionLayers[option].length; l++) {
				layer = optionLayers[option][l];
				items = getPageItems('<*>', doc, layer.name);
				if (items.length === 0) continue; // Skip empty layers
				items = getPageItems('<*>', items[0].parentPage.parent, layer.name);
				while ((item = items.pop())) try { item.duplicate(doc.spreads[0]); item.remove(); } catch (_) {}
			}
		}

		doc.spreads.itemByRange(1, doc.spreads.length - 1).remove();

	// 3. Source/destination mismatch
	} else {
		alert('Source/destination mismatch'
			+ '\nSource: ' + doc.spreads.length + ' spreads.'
			+ '\nDestination: \'' + optionNames.join('\', \'')
			+ '\' (' + optionNames.length + ' options).'
		);
	}
}
