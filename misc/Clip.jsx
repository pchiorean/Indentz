/*
	Clip 23.11.25
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Clips selected objects in a clipping frame (or releases them if already clipped).

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection, UndoModes.ENTIRE_SCRIPT, 'Clip selected objects');

function main(selection) {
	var bounds, outlines, clipFrame, i, n;
	var item = selection[0];
	var items = [];
	var isClippingFrameRE = /^<(auto )?clip(ping)? frame>$/i;
	var isClippingGroupRE = /^<(auto )?clip(ping)? group>$/i;
	var old = {
		URL: app.generalPreferences.ungroupRemembersLayers,
		PRL: app.clipboardPreferences.pasteRemembersLayers
	};

	// Remember layers when grouping/ungrouping
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;

	// Only clip objects directly on spread
	if (!/spread/i.test(item.parent.constructor.name)) {
		alert('Can\'t clip this, try selecting the parent.');
		cleanupAndExit();
	}

	// If already clipped, release objects instead
	if (selection.length === 1 && isClippingFrameRE.test(item.name)) {
		undoClip(item);
		cleanupAndExit();
	}

	// If multiple objects are selected, group them
	bounds = item.visibleBounds;
	if (selection.length > 1) {
		for (i = 0, n = selection.length; i < n; i++)
			if (!selection[i].locked) items.push(selection[i]);
		item = doc.groups.add(items);
		item.name = '<auto clipping group>';
		bounds = item.visibleBounds;
	} else if (selection.length === 1 // Special case: text frames
		&& selection[0].constructor.name === 'TextFrame'
		&& (selection[0].contents.replace(/^\s+|\s+$/g, '')).length > 0
		&& item.fillColor.name === 'None') {
		outlines = selection[0].createOutlines(false);
		bounds = [
			item.geometricBounds[0], outlines[0].geometricBounds[1],
			item.geometricBounds[2], outlines[0].geometricBounds[3]
		];
		outlines[0].remove();
	}
	clipFrame = doc.rectangles.add(
		item.itemLayer,
		LocationOptions.AFTER, item,
		{
			name: '<clipping frame>',
			label: item.label,
			fillColor:   'None',
			strokeColor: 'None',
			bottomLeftCornerOption:  CornerOptions.NONE,
			bottomRightCornerOption: CornerOptions.NONE,
			topLeftCornerOption:     CornerOptions.NONE,
			topRightCornerOption:    CornerOptions.NONE,
			geometricBounds: bounds
		}
	);
	clipFrame.sendToBack(item);
	app.select(item); app.cut();
	app.select(clipFrame); app.pasteInto();
	cleanupAndExit();

	function undoClip(container) {
		var objects = [];
		var payload = container.pageItems[0].duplicate();
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

	function cleanupAndExit() {
		app.generalPreferences.ungroupRemembersLayers = old.URL;
		app.clipboardPreferences.pasteRemembersLayers = old.PRL;
		exit();
	}
}
