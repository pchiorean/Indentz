/*
	Offset Paths v1.2 (2021-09-11)

	Use InDesign's text wrap feature to create offset/inset paths.

	(c) Olav Martin Kvern. Distributed by Silicon Publishing, Inc.
	https://creativepro.com/indesign-cad-tool/
	https://www.siliconpublishing.com/blog/free-indesign-scripts/

	Changes by Paul Chiorean (jpeg@basement.ro):
	- Default value is in millimeters;
	- Select outlined paths on exit;
	- Add undo.
*/

/* eslint-disable no-with */

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection,
	UndoModes.ENTIRE_SCRIPT, 'Offset paths');

function main(selection) {
	var objectList = [];
	var oldMU  = app.scriptPreferences.measurementUnit;
	var oldUIL = app.scriptPreferences.userInteractionLevel;
	app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;

	for (var i = 0, n = selection.length; i < n; i++) {
		switch (selection[i].constructor.name) {
			case 'GraphicLine':
			case 'Rectangle':
			case 'Oval':
			case 'Polygon':
				objectList.push(selection[i]);
				break;
		}
	}
	if (objectList.length > 0) displayDialog(objectList);
	app.scriptPreferences.measurementUnit = oldMU;
	app.scriptPreferences.userInteractionLevel = oldUIL;
}

function displayDialog(objectList) {
	var offsetField, result, offset;
	var dialog = app.dialogs.add({ name: 'Offset Paths' });
	with (dialog.dialogColumns.add()) {
		with (dialogRows.add()) {
			with (dialogColumns.add()) {
				staticTexts.add({ staticLabel: 'Offset:' });
			}
			with (dialogColumns.add()) {
				offsetField = measurementEditboxes.add({
					minWidth:   85,
					editUnits:  MeasurementUnits.MILLIMETERS,
					editValue:  UnitValue('3 mm').as('pt'),
					smallNudge: 1,
					largeNudge: 1
				});
			}
		}
	}
	result = dialog.show();
	if (result) {
		offset = offsetField.editValue;
		dialog.destroy();
		offsetPaths(objectList, offset);
	} else { dialog.destroy(); }
}

function offsetPaths(objectList, offset) {
	app.select(NothingEnum.NOTHING);
	for (var i = 0, n = objectList.length; i < n; i++)
		app.select(offsetPath(objectList[i], offset), SelectionOptions.ADD_TO);
}

function offsetPath(pageItem, offset) {
	var offsetArray, textWrapPaths, newPageItem;
	pageItem.textWrapPreferences.textWrapMode = TextWrapModes.CONTOUR;
	offsetArray = makeOffsetArray(pageItem, offset);
	pageItem.textWrapPreferences.textWrapOffset = offsetArray;
	textWrapPaths = pageItem.textWrapPreferences.paths;
	newPageItem = pageItem.parent.polygons.add();
	for (var i = 0, n = textWrapPaths.length; i < n; i++) {
		if (i > 0) newPageItem.paths.add();
		newPageItem.paths.item(i).pathType   = textWrapPaths.item(i).pathType;
		newPageItem.paths.item(i).entirePath = textWrapPaths.item(i).entirePath;
	}
	pageItem.textWrapPreferences.textWrapMode = TextWrapModes.NONE;
	return newPageItem;

	function makeOffsetArray() {
		var array, arrayLength;
		if (pageItem.textWrapPreferences.textWrapOffset.length > 0) {
			arrayLength = pageItem.textWrapPreferences.textWrapOffset.length;
			array = new Array(arrayLength);
			for (var i = 0, n = arrayLength; i < n; i++) array[i] = offset;
			return array;
		}
		return offset;
	}
}
