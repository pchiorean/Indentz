/*
	Release clip 26.3.10
	(c) 2020-2026 Paul Chiorean <jpeg@basement.ro>

	Releases selected objects from their clipping frames.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Release clipped objects');

function main() {
	var item;
	var items = (doc.selection.length === 0)
		? app.activeWindow.activeSpread.pageItems.everyItem().getElements()
		: doc.selection;
	var layers = [];
	var isClippingFrameRE = /^<(auto )?clip(ping)? frame>$/i;
	var isClippingGroupRE = /^<(auto )?clip(ping)? group>$/i;
	var old = {
		URL: app.generalPreferences.ungroupRemembersLayers,
		PRL: app.clipboardPreferences.pasteRemembersLayers
	};

	// Remember layers when grouping/ungrouping
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;

	// Restore clipped objects
	while ((item = items.shift())) {
		// Ignore embedded objects
		if (!/spread/i.test(item.parent.constructor.name)) {
			app.select(item, SelectionOptions.REMOVE_FROM);
			continue;
		}

		// Ignore objects that are not clipped
		if (!isClippingFrameRE.test(item.name)) {
			app.select(item, SelectionOptions.REMOVE_FROM);
			continue;
		}

		undoClip(item);
	}

	// Restore settings
	app.generalPreferences.ungroupRemembersLayers = old.URL;
	app.clipboardPreferences.pasteRemembersLayers = old.PRL;

	function undoClip(container) {
		var payload;
		var objects = [];

		if (container.pageItems.length === 0) return;

		// Create layers for clipped objects
		if (container.extractLabel('clippedItemLayers') !== '') {
			layers = container.extractLabel('clippedItemLayers').split(',,');
			for (i = layers.length - 1; i >= 0; i--)
				try { doc.layers.add({ name: layers[i] })
					.move(LocationOptions.AFTER, container.itemLayer); } catch (e) {}
		}

		// Extract payload
		payload = container.pageItems[0].duplicate();
		payload.sendToBack(container);
		container.remove();

		if (isClippingGroupRE.test(payload.name)) {
			objects = payload.pageItems.everyItem().getElements();
			payload.ungroup();
			app.select(objects, SelectionOptions.ADD_TO);
		} else {
			app.select(payload, SelectionOptions.ADD_TO);
		}
	}
}
