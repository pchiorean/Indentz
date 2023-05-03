/*
	Page ratios 23.5.3
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Adds a label with the visible area and margins ratio on each page's slug.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @includepath '.;./lib;../lib';
// @include 'getBounds.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'Label page ratios');

function main() {
	var visible, margins;
	for (var i = 0, n = doc.pages.length; i < n; i++) {
		visible = getBounds(doc.pages.item(i)).page.visible;
		margins = getBounds(doc.pages.item(i)).page.margins;
		slugInfo(
			doc.pages.item(i),
			'Visible R:' +
			((visible[3] - visible[1]) / (visible[2] - visible[0])).toFixed(3) +
			'\u2003Margins R:' +
			((margins[3] - margins[1]) / (margins[2] - margins[0])).toFixed(3),
			false
		);
	}

	function slugInfo(/*object*/page, /*string*/label, /*bool*/isCaps, /*bool*/isOnTop) {
		var item, infoFrame, infoText;
		var items = page.pageItems.everyItem().getElements();
		var infoLayerName = 'info';
		var infoLayer = doc.layers.item(infoLayerName);
		var idLayerName = 'id';
		var idLayer = doc.layers.item(idLayerName);

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
		if (idLayer.isValid) infoLayer.move(LocationOptions.after, idLayer);
		else infoLayer.move(LocationOptions.AT_BEGINNING);
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
			capitalization: isCaps ? Capitalization.ALL_CAPS : Capitalization.NORMAL,
			horizontalScale: 100
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
				if (doc.documentPreferences.slugTopOffset < pageMarksHeight +
					doc.documentPreferences.documentBleedTopOffset) {
					doc.documentPreferences.slugTopOffset = pageMarksHeight +
					doc.documentPreferences.documentBleedTopOffset;
				}
				infoFrame.move([
					page.bounds[1] + 10,
					page.bounds[0] -
						doc.documentPreferences.documentBleedTopOffset -
						UnitValue('1 mm').as('pt') -
						(15 - (infoFrame.geometricBounds[2] - infoFrame.geometricBounds[0])) / 2 -
						(infoFrame.geometricBounds[2] - infoFrame.geometricBounds[0])
				]);
				break;
			case false:
				if (doc.documentPreferences.slugBottomOffset < pageMarksHeight +
					doc.documentPreferences.documentBleedBottomOffset) {
					doc.documentPreferences.slugBottomOffset = pageMarksHeight +
					doc.documentPreferences.documentBleedBottomOffset;
				}
				infoFrame.move([
					page.bounds[1] + 10,
					page.bounds[2] +
						UnitValue('1 mm').as('pt') +
						doc.documentPreferences.documentBleedBottomOffset +
						(15 - (infoFrame.geometricBounds[2] - infoFrame.geometricBounds[0])) / 2
				]);
				break;
		}
	}
}
