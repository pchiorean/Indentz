/*
	Split/join spreads by layers 24.6.16
	(c) 2024 Paul Chiorean <jpeg@basement.ro>

	Splits or joins document spreads using special layers.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @includepath '.;./lib;../lib';
// @include 'getPageItems.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Split/join spreads by layers');

function main() {
	var item, items, layer, i, j;
	var msg = [];
	var layers = [ 'DE', 'FR', 'IT' ]; // Special layers
	app.scriptPreferences.enableRedraw = false;

	// Check if all special layers are valid
	for (i = 0; i < layers.length; i++) if (!doc.layers.itemByName(layers[i]).isValid) msg.push(layers[i]);
	if (msg.length > 0) {
		alert('Missing layers\nThe document must also contain the following layers:\n\'' + msg.join('\', \'') + '\'.');
		exit();
	}

	// One spread? Split by special layers
	// Duplicate the first spread and filter special layers' items for each spread
	if (doc.spreads.length === 1) {
		for (i = 1; i < layers.length; i++) doc.spreads[0].duplicate(LocationOptions.AT_END);
		for (i = 0; i < doc.spreads.length; i++) {
			for (j = 0; j < layers.length; j++) {
				if ((layer = doc.layers.itemByName(layers[j])).isValid) layer.visible = true;
				else continue;
				if (i === j) continue;
				items = getPageItems('<*>', doc.spreads[i], layer.name);
				if (!items) continue;
				while ((item = items.shift())) try { item.remove(); } catch (_) {}
			}
		}
	// Multiple spreads? Combine by special layers
	// Get each special layer's parent spread and move items to the first spread
	} else if (doc.spreads.length === layers.length) {
		for (i = 0; i < layers.length; i++) {
			items = getPageItems('<*>', doc, layers[i]);
			if (!items) { alert('Warning\nLayer \'' + layers[i] + '\' is empty.'); continue; }
			items = getPageItems('<*>', items[0].parentPage.parent, layers[i]);
			while ((item = items.shift())) {
				try {
					item.duplicate(doc.spreads[0]);
					item.remove();
				} catch (_) {}
			}
		}
		doc.spreads.itemByRange(1, doc.spreads.length - 1).remove(); // Remove obsolete spreads
	} else {
		alert('Mismatched spreads\nThe document must have either one or ' + layers.length + ' spreads.');
	}
}
