/*
	Page ratios 23.10.7
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Adds a label with the page/visible area/margins' ratios on each page's slug.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

// @includepath '.;./lib;../lib;../../lib';
// @include 'getBounds.jsxinc';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Label page ratios');

function main() {
	var i, n, page, pgB, mgB, visB, hasVisArea, hasMargins;
	var msg = '';

	for (i = 0, n = doc.pages.length; i < n; i++) {
		page = doc.pages.item(i);
		pgB  = getBounds(page).page.size;
		visB = getBounds(page).page.visible;
		mgB  = getBounds(page).page.margins;

		hasVisArea = round(visB[0], 10) !== round(pgB[0], 10)
			|| round(visB[1], 10) !== round(pgB[1], 10)
			|| round(visB[2], 10) !== round(pgB[2], 10)
			|| round(visB[3], 10) !== round(pgB[3], 10);
		hasMargins = (page.marginPreferences.top
			+ page.marginPreferences.left
			+ page.marginPreferences.bottom
			+ page.marginPreferences.right > 0)
			&& (round(visB[0], 10) !== round(mgB[0], 10)
			|| round(visB[1], 10) !== round(mgB[1], 10)
			|| round(visB[2], 10) !== round(mgB[2], 10)
			|| round(visB[3], 10) !== round(mgB[3], 10));

		msg = (hasVisArea || hasMargins ? 'Ratios:\u2003Page:' : 'Page ratio:')
			+ fix((pgB[3] - pgB[1]) / (pgB[2] - pgB[0]));
		if (hasVisArea) msg += '\u2003Visible area:' + fix((visB[3] - visB[1]) / (visB[2] - visB[0]));
		if (hasMargins) msg += '\u2003Margins:' + fix((mgB[3] - mgB[1]) / (mgB[2] - mgB[0]));

		slugInfo(doc.pages.item(i), msg, false, true);
	}

	function round(/*number*/number, /*number*/decimals) {
		decimals = decimals || 3;
		var multiplier = Math.pow(10, decimals);
		return Math.round(number * multiplier) / multiplier;
	}

	function fix(/*number*/number, /*number*/decimals) {
		decimals = decimals || 3;
		return number.toFixed(decimals).replace(/\.?0+$/, '');
	}

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
