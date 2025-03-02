/*
	Split/join spreads by layers 25.2.26
	(c) 2025 Paul Chiorean <jpeg@basement.ro>

	Splits or joins document spreads using a list of layers.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @includepath '.;./lib;../lib;../../lib';
// @include 'getPageItems.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Split/join spreads by layers');

function main() {
	var item, items, layer, i, j;
	var layers = {
		master: [ 'EN', 'DE', 'FR', 'IT' ],
		used: []
	};

	app.scriptPreferences.enableRedraw = false;

	// Build a list of valid layers from the master list
	for (i = 0; i < layers.master.length; i++)
		if ((layer = doc.layers.itemByName(layers.master[i])).isValid) layers.used.push(layer);

	// If we have one spread, split it by layers
	if (doc.spreads.length === 1 && layers.used.length > 1) {
		// Duplicate the first spread
		for (i = 1; i < layers.used.length; i++) doc.spreads[0].duplicate(LocationOptions.AT_END);

		// For each spread, keep only the items on the corresponding layer
		for (i = 0; i < doc.spreads.length; i++) {
			for (j = 0; j < layers.used.length; j++) {
				layer = doc.layers.itemByName(layers.used[j].name);
				if (i === j) continue; // Skip self

				items = getPageItems('<*>', doc.spreads[i], layer.name);
				if (items.length === 0) continue; // Skip empty layers

				while ((item = items.shift())) try { item.remove(); } catch (_) {}
			}
		}

	// If we have multiple spreads, combine them:
	// Get each layer's parent spread and move items to the first spread
	} else if (doc.spreads.length <= layers.used.length) {
		for (i = 0; i < layers.used.length; i++) {
			layer = layers.used[i];
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

		// Remove obsolete spreads
		doc.spreads.itemByRange(1, doc.spreads.length - 1).remove();
	} else if (layers.used.length > 0) {
		alert('Source/destination mismatch'
			+ '\nSource: ' + doc.spreads.length + ' spreads.'
			+ ' \nTarget: ' + layers.used.length + ' layers: \''
			+ (function (r) {
				var i, rr; for (i = 0, rr = []; i < r.length; i++) rr[i] = r[i].name; return rr;
				}(layers.used)).join('\', \'')
			+ '\'.'
		);
	}
}
