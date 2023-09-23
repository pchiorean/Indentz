/*
	Label page 23.9.23
	(c) 2021-2023 Paul Chiorean <jpeg@basement.ro>

	Adds a custom label on the current page's slug.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Label page');

function main() {
	var onTop = true;
	var ui = new Window('dialog', 'Label page ' + app.activeWindow.activePage.name);
	ui.orientation = 'row';
	ui.alignChildren = [ 'left', 'fill' ];
	ui.main = ui.add('panel', undefined, undefined);
	ui.main.orientation = 'column';
	ui.main.alignChildren = [ 'left', 'top' ];
	ui.main.add('statictext', undefined, 'Enter label text:');
	ui.label = ui.main.add('edittext', undefined, '', { enterKeySignalsOnChange: true });
	ui.label.characters = 40;
	ui.label.active = true;
	ui.caps = ui.main.add('checkbox', undefined, 'Uppercase text');
	ui.caps.value = true;
	ui.actions = ui.add('group', undefined);
	ui.actions.orientation = 'column';
	ui.actions.alignChildren = [ 'fill', 'top' ];
	ui.ontop = ui.actions.add('button', undefined, 'On top', { name: 'ok' });
	ui.onbottom = ui.actions.add('button', undefined, 'On bottom');
	ui.actions.add('button', undefined, 'Cancel', { name: 'cancel' });
	ui.ontop.onClick = function () { onTop = true; ui.close(); };
	ui.onbottom.onClick = function () { onTop = false; ui.close(); };
	ui.onShow = function () {
		ui.frameLocation = [
			(app.activeWindow.bounds[1] + app.activeWindow.bounds[3] - ui.frameSize.width) / 2,
			(app.activeWindow.bounds[0] + app.activeWindow.bounds[2] - ui.frameSize.height) / 2
		];
	};

	if (ui.show() === 2) exit();
	slugInfo(app.activeWindow.activePage, ui.label.text, ui.caps.value, onTop);

	function slugInfo(/*object*/page, /*string*/label, /*bool*/isCaps, /*bool*/isOnTop) {
		var item, infoFrame, infoText;
		var items = page.pageItems.everyItem().getElements();
		var infoLayerName = 'info';
		var infoLayer = doc.layers.item(infoLayerName);

		app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
		isCaps  = (isCaps  === undefined) ? true : isCaps;
		isOnTop = (isOnTop === undefined) ? true : isOnTop;
		// Make layer
		if (!infoLayer.isValid) {
			doc.layers.add({
				name:       infoLayerName,
				layerColor: UIColors.CYAN,
				visible:    true,
				locked:     false,
				printable:  true
			});
		}
		infoLayer.move(LocationOptions.AT_BEGINNING);
		// Remove old page labels
		while ((item = items.shift()))
			if (item.name === '<page label>') { item.itemLayer.locked = false; item.remove(); }
		// Add new label
		if (label === '') { label = doc.name; isCaps = false; }
		label = label.replace(/^\s+|\s+$/g, '');
		doc.activeLayer = infoLayer;
		infoFrame = page.textFrames.add({
			itemLayer: infoLayer.name,
			name:      '<page label>',
			bottomLeftCornerOption:  CornerOptions.NONE,
			bottomRightCornerOption: CornerOptions.NONE,
			topLeftCornerOption:     CornerOptions.NONE,
			topRightCornerOption:    CornerOptions.NONE,
			contents:  label
		});
		infoText = infoFrame.parentStory.paragraphs.everyItem();
		infoText.properties = {
			appliedFont:    app.fonts.item('Helvetica\tRegular'),
			pointSize:      6,
			fillColor:      'Registration',
			strokeWeight:   '0.4 pt',
			strokeColor:    'Paper',
			// endJoin:        EndJoin.ROUND_END_JOIN,
			capitalization: isCaps ? Capitalization.ALL_CAPS : Capitalization.NORMAL
		};
		infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
		infoFrame.textFramePreferences.properties = {
			verticalJustification:        VerticalJustification.TOP_ALIGN,
			firstBaselineOffset:          FirstBaseline.CAP_HEIGHT,
			autoSizingReferencePoint:     AutoSizingReferenceEnum.TOP_LEFT_POINT,
			autoSizingType:               AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
			useNoLineBreaksForAutoSizing: true
		};
		// Move frame in position
		var pageMarksHeight = 15 + UnitValue('1 mm').as('pt');
		switch (isOnTop) {
			case true:
				if (doc.documentPreferences.slugTopOffset < pageMarksHeight
						+ doc.documentPreferences.documentBleedTopOffset) {
					doc.documentPreferences.slugTopOffset = pageMarksHeight
						+ doc.documentPreferences.documentBleedTopOffset;
				}
				infoFrame.move([
					page.bounds[1] + 10,
					page.bounds[0]
						- doc.documentPreferences.documentBleedTopOffset
						- UnitValue('1 mm').as('pt')
						- (15 - (infoFrame.geometricBounds[2] - infoFrame.geometricBounds[0])) / 2
						- (infoFrame.geometricBounds[2] - infoFrame.geometricBounds[0])
				]);
				break;
			case false:
				if (doc.documentPreferences.slugBottomOffset < pageMarksHeight
						+ doc.documentPreferences.documentBleedBottomOffset) {
					doc.documentPreferences.slugBottomOffset = pageMarksHeight
						+ doc.documentPreferences.documentBleedBottomOffset;
				}
				infoFrame.move([
					page.bounds[1] + 10,
					page.bounds[2]
						+ UnitValue('1 mm').as('pt')
						+ doc.documentPreferences.documentBleedBottomOffset
						+ (15 - (infoFrame.geometricBounds[2] - infoFrame.geometricBounds[0])) / 2
				]);
				break;
		}
	}
}
