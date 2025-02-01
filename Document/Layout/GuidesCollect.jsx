/*
	Collect guides 25.1.6
	(c) 2021-2025 Paul Chiorean <jpeg@basement.ro>

	Moves all guides to the '.guides' layer.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Collect guides');

function main() {
	var i, n, layer, guidesLayer;
	var lockedLayers = [];
	var guidesLayerName = '.guides';

	// Preserve locked state in a list and unlock locked layers
	for (i = 0, n = doc.layers.length; i < n; i++) {
		layer = doc.layers.item(i);
		if (layer.locked) {
			layer.locked = false;
			lockedLayers.push(layer.name);
		}
	}

	// Create guides layer
	guidesLayer = doc.layers.item(guidesLayerName);
	if (guidesLayer.isValid) {
		guidesLayer.properties = { visible: true, locked: false };
	} else {
		guidesLayer = doc.layers.add({
			name: guidesLayerName,
			layerColor: UIColors.MAGENTA,
			visible: true,
			printable: false,
			locked: false
		}).move(LocationOptions.AT_BEGINNING);
	}

	doc.guidePreferences.guidesShown = true;
	doc.guidePreferences.guidesLocked = false;
	doc.guides.everyItem().itemLayer = guidesLayer;

	// Restore locked state from the previously saved list
	for (i = 0, n = lockedLayers.length; i < n; i++) {
		layer = doc.layers.item(lockedLayers[i]);
		if (layer.isValid) layer.locked = true;
	}

	lockedLayers = [];
}
