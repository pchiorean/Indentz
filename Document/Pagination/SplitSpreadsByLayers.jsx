/*
	Split/join spreads by layout 25.3.9
	(c) 2025 Paul Chiorean <jpeg@basement.ro>

	Splits or joins document spreads using a list of layout.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @includepath '.;./lib;../lib;../../lib';
// @include 'getPageItems.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Split/join spreads by layout');

function main() {
	var item, layer, layout, i, k, l;
	var items = [];
	var layoutRE = /^.*:\s*(.+)\s*$/; // Match layers containing ':<layout>'
	var layoutLayers = {};
	var layoutNames = [];

	app.scriptPreferences.enableRedraw = false;

	// Build a list of layouts
	for (i = 0; i < doc.layers.length; i++) {
		layer = doc.layers[i];
		if (layoutRE.test(layer.name))
			layoutLayers[layer.name.match(layoutRE)[1]] = [];
	}
	for (var key in layoutLayers)
		if (Object.prototype.hasOwnProperty.call(layoutLayers, key)) layoutNames.push(key);
	if (layoutNames.length === 0) exit();

	// Build a list of corresponding layers
	for (i = 0; i < doc.layers.length; i++) {
		layer = doc.layers[i];
		if (layoutRE.test(layer.name))
			layoutLayers[layer.name.match(layoutRE)[1]].push(layer);
	}

	// If we have one spread, split it by layouts
	if (doc.spreads.length === 1 && layoutNames.length > 1) {
		// Duplicate the first spread
		for (i = 1; i < layoutNames.length; i++) doc.spreads[0].duplicate(LocationOptions.AT_END);

		// For each spread, keep the corresponding layout and delete others
		for (i = 0; i < doc.spreads.length; i++) {
			for (k = 0; k < layoutNames.length; k++) {
				layout = layoutNames[k];
				if (k === i) continue; // Skip self

				for (l = 0; l < layoutLayers[layout].length; l++) {
					layer = layoutLayers[layout][l];
					items = getPageItems('<*>', doc.spreads[i], layer.name);
					if (items.length === 0) continue; // Skip empty layers
					while ((item = items.shift())) try { item.remove(); } catch (_) {}
				}
			}
		}

	// If we have multiple spreads, combine them:
	// Get each layer's parent spread and move items to the first spread
	} else if (doc.spreads.length <= layoutNames.length) {
		for (k = 0; k < layoutNames.length; k++) {
			layout = layoutNames[k];

			for (l = 0; l < layoutLayers[layout].length; l++) {
				layer = layoutLayers[layout][l];
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
	} else if (layoutNames.length > 0) {
		alert('Source/destination mismatch'
			+ '\nSource: ' + doc.spreads.length + ' spreads.'
			+ '\nDestination: \'' + layoutNames.join('\', \'')
			+ '\' (' + layoutNames.length + ' layouts).'
		);
	}
}
