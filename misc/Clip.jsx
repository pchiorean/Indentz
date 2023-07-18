/*
	Clip 23.7.18
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Clips selected objects in a clipping frame (or releases them if already clipped).

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection,
	UndoModes.ENTIRE_SCRIPT, 'Clipping');

function main(selection) {
	var bounds, outlines, clipFrame;
	var item = selection[0];
	var items = [];
	var clippingFrameRE = /^<(auto )?clip(ping)? frame>$/i;
	var clippingGroupRE = /^<(auto )?clip(ping)? group>$/i;
	var oldURL = app.generalPreferences.ungroupRemembersLayers;
	var oldPRL = app.clipboardPreferences.pasteRemembersLayers;
	app.generalPreferences.ungroupRemembersLayers = true;
	app.clipboardPreferences.pasteRemembersLayers = true;

	// Exceptions
	// -- Only clip objects directly on spread
	if (!/spread/i.test(item.parent.constructor.name)) {
		alert('Can\'t clip this, try selecting the parent.');
		cleanupAndExit();
	}
	// -- Undo if already clipped
	if (selection.length === 1 && clippingFrameRE.test(item.name)) {
		undoClip(item);
		cleanupAndExit();
	}

	// If multiple objects are selected, group them
	bounds = item.visibleBounds;
	if (selection.length > 1) {
		for (var i = 0, n = selection.length; i < n; i++)
			if (!selection[i].locked) items.push(selection[i]);
		item = doc.groups.add(items);
		item.name = '<auto clipping group>';
		bounds = item.visibleBounds;
	} else if (selection.length === 1 &&
			selection[0].constructor.name === 'TextFrame' &&
			(selection[0].contents.replace(/^\s+|\s+$/g, '')).length > 0) {
		// Special case: text frames
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

	function undoClip(frame) {
		var oldSelection;
		var child = frame.pageItems[0].duplicate();
		child.sendToBack(frame);
		frame.remove();
		app.select(child);
		if (clippingGroupRE.test(child.name)) {
			oldSelection = child.pageItems.everyItem().getElements();
			child.ungroup();
			app.select(oldSelection);
		}
	}

	function cleanupAndExit() {
		app.generalPreferences.ungroupRemembersLayers = oldURL;
		app.clipboardPreferences.pasteRemembersLayers = oldPRL;
		exit();
	}
}
