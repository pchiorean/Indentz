/*
	Offset paths 23.10.31

	Use InDesign's text wrap feature to create offset/inset paths.

	This is a modified version of a script by Olav Martin Kvern with some tweaks:
	- Now takes any objects as source;
	- Duplicates the source object to avoid some corner cases (e.g., images);
	- Selects the outlined paths on exit;
	- Has a default value in millimeters;
	- Has an option for joining contours;
	- Has undo.

	Original version: (c) 2020 Olav Martin Kvern.
	Distributed by Silicon Publishing, Inc.
	https://creativepro.com/indesign-cad-tool/
	https://www.siliconpublishing.com/blog/free-indesign-scripts/

	This version: 2023/10/31 Paul Chiorean <jpeg@basement.ro>
*/

/* eslint-disable no-with */

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

// app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection, UndoModes.ENTIRE_SCRIPT, 'Offset paths');
main(doc.selection);

function main(selection) {
	var i, j, ui, offsetField, offset, groupItems;
	var paths = [];
	var groupPaths = [];
	var old = {
		MU:  app.scriptPreferences.measurementUnit,
		UIL: app.scriptPreferences.userInteractionLevel
	};
	app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
	app.scriptPreferences.enableRedraw = false;

	ui = app.dialogs.add({ name: 'Offset Paths' });
	with (ui.dialogColumns.add()) {
		with (dialogRows.add()) {
			staticTexts.add({ staticLabel: 'Offset:' });
			offsetField = measurementEditboxes.add({
				minWidth:   85,
				editUnits:  MeasurementUnits.MILLIMETERS,
				editValue:  UnitValue('3 mm').as('pt'),
				smallNudge: 1,
				largeNudge: 1
			});
		}
		with (dialogRows.add()) { '' }
		with (dialogRows.add()) {
			joinCB = checkboxControls.add({
				staticLabel: 'Join contours',
				checkedState: true
			});
		}
		with (ui.dialogColumns.add()) { '' }
	}

	if (ui.show()) {
		offset = offsetField.editValue;
		for (i = 0; i < selection.length; i++) {
			// We process each member of a group so we don't get a boring rectangle
			if (selection[i].constructor.name === 'Group') {
				groupItems = selection[i].pageItems.everyItem().getElements();
				groupPaths = [];
				for (j = 0; j < groupItems.length; j++) groupPaths.push(offsetPath(groupItems[j]));
				if (groupPaths.length > 1) groupPaths = (groupPaths.shift()).addPath(groupPaths);
				paths.push(groupPaths);
			} else {
				paths.push(offsetPath(selection[i]));
			}
		}
		if (joinCB.checkedState && paths.length > 1) paths = (paths.shift()).addPath(paths);
		app.select(paths);
	}

	ui.destroy();
	app.scriptPreferences.measurementUnit = old.MU;
	app.scriptPreferences.userInteractionLevel = old.UIL;

	function offsetPath(item) {
		var i, ghostItem, wrapPaths, newPath;

		// We process a duplicate of the object, stripped of content
		ghostItem = item.duplicate();
		if (ghostItem.pageItems.length > 0 && ghostItem.constructor.name !== 'Group')
			ghostItem.pageItems.everyItem().remove();

		ghostItem.textWrapPreferences.textWrapMode = TextWrapModes.CONTOUR;
		ghostItem.textWrapPreferences.textWrapOffset = [ offset, offset, offset, offset ];
		wrapPaths = ghostItem.textWrapPreferences.paths;
		newPath = ghostItem.parent.polygons.add();

		for (i = 0; i < wrapPaths.length; i++) {
			if (i > 0) newPath.paths.add();
			newPath.paths.item(i).pathType   = wrapPaths.item(i).pathType;
			newPath.paths.item(i).entirePath = wrapPaths.item(i).entirePath;
		}
		ghostItem.remove();

		return newPath;
	}
}
