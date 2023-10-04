/*
	Offset paths 23.10.4

	Use InDesign's text wrap feature to create offset/inset paths.

	Original version (c) 2020 Olav Martin Kvern.
	Distributed by Silicon Publishing, Inc.
	https://creativepro.com/indesign-cad-tool/
	https://www.siliconpublishing.com/blog/free-indesign-scripts/

	This is a custom version of the above script with some tweaks:

	- Now takes any objects as source;
	- Duplicates the source object to avoid some corner cases (e.g., images);
	- Selects the outlined paths on exit;
	- Has a default value in millimeters;
	- Has an option for joining contours;
	- Has undo.

	2021/09/22
	Paul Chiorean <jpeg@basement.ro>
*/

/* eslint-disable no-with */

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection, UndoModes.FAST_ENTIRE_SCRIPT, 'Offset paths');

function main(selection) {
	var i, ui, joinContours, offsetField, offset;
	var paths = [];
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
		joinContours = joinCB.checkedState;
		for (i = 0; i < selection.length; i++) paths.push(offsetPath(selection[i]));
		if (joinContours && paths.length > 1) paths = (paths.shift()).addPath(paths);
		app.select(paths);
	}
	ui.destroy();
	app.scriptPreferences.measurementUnit = old.MU;
	app.scriptPreferences.userInteractionLevel = old.UIL;

	function offsetPath(item) {
		var i, tmpItem, wrapPaths, newPath;
		tmpItem = item.duplicate();
		if (tmpItem.contentType === ContentType.GRAPHIC_TYPE && tmpItem.graphics.length === 1)
			tmpItem.pageItems[0].remove();
		tmpItem.textWrapPreferences.textWrapMode = TextWrapModes.CONTOUR;
		tmpItem.textWrapPreferences.textWrapOffset = [ offset, offset, offset, offset ];
		wrapPaths = tmpItem.textWrapPreferences.paths;
		newPath = tmpItem.parent.polygons.add();
		for (i = 0; i < wrapPaths.length; i++) {
			if (i > 0) newPath.paths.add();
			newPath.paths.item(i).pathType   = wrapPaths.item(i).pathType;
			newPath.paths.item(i).entirePath = wrapPaths.item(i).entirePath;
		}
		tmpItem.remove();
		return newPath;
	}
}
