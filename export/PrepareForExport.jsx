/*
	Prepare for export 23.5.23
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Hides some layers and moves objects with special colors to separate spreads.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

// @includepath '.;./lib;../lib';
// @include 'isInArray.jsxinc';

if (!(doc = app.activeDocument)) exit();

app.doScript(prepareForExport, ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Prepare for export');

function prepareForExport() {
	var i, n, l, variants;
	var layerNames = {
		hidden:   [ '-*', '.*' ],
		info:     [ 'info' ],
		covered:  [ 'covered area*' ],
		visible:  [ 'visible area', 'rahmen', 'sicht*', '*vi?ib*' ],
		safe:     [ 'safe*area', 'safe*margins', 'segmentation' ],
		fold:     [ 'fold', 'falz' ],
		guides:   [ 'guides', 'grid', 'masuratori' ],
		dielines: [ 'dielines', 'cut', 'cut*line*', 'decoupe', 'die', 'die*cut', 'stanz*' ],
		varnish:  [ 'varnish', 'uv' ],
		foil:     [ 'foil', 'silver', 'silver foil' ],
		white:    [ 'white' ]
	};
	var matched = { dielines: [], varnish: [], foil: [], white: [] };
	app.scriptPreferences.enableRedraw = false;

	// Unlock all layers
	doc.layers.everyItem().locked = false;

	// Match special layers
	for (i = 0, n = doc.layers.length; i < n; i++) {
		l = doc.layers[i];
		if (!l.visible) continue;
		if (l.name === layerNames.info[0]) continue;

		for (variants in layerNames) {
			if (isInArray(l.name, layerNames[variants])) {
				switch (layerNames[variants][0]) {
					case layerNames.hidden[0]:
					case layerNames.covered[0]:
					case layerNames.visible[0]:
					case layerNames.safe[0]:
					case layerNames.fold[0]:
					case layerNames.guides[0]:
						l.visible = false;
						break;
					case layerNames.dielines[0]:
						matched.dielines.push(l);
						l.visible = true;
						break;
					case layerNames.varnish[0]:
						matched.varnish.push(l);
						l.visible = true;
						break;
					case layerNames.foil[0]:
						matched.foil.push(l);
						l.visible = true;
						break;
					case layerNames.white[0]:
						matched.white.push(l);
						l.visible = true;
						break;
				}
				break;
			}
		}
	}

	// Move items from special layers on separate spreads
	// for (i = 0; i < matched.dielines.length; i++) moveSpecials(matched.dielines[i]);
	for (i = 0; i < matched.varnish.length;  i++) moveSpecials(matched.varnish[i]);
	for (i = 0; i < matched.foil.length;     i++) moveSpecials(matched.foil[i]);
	for (i = 0; i < matched.white.length;    i++) moveSpecials(matched.white[i]);

	// Move all items from 'layer' to a separate spread
	function moveSpecials(layer) {
		var thisSpread, nextSpread, item, items;
		for (var i = 0; i < doc.spreads.length; i++) {
			thisSpread = doc.spreads[i];
			if (!layerHasItems(thisSpread)) continue;
			nextSpread = thisSpread.duplicate(LocationOptions.AFTER, thisSpread);

			// Step 1: Delete items on 'layer' from this spread
			items = thisSpread.pageItems.everyItem().getElements();
			while ((item = items.shift())) {
				if (item.itemLayer === layer) {
					if (item.locked) item.locked = false;
					if (item.name !== '<page label>') item.remove(); // Preserve page labels
				}
			}

			// Step 2: Delete items not on 'layer' from next spread
			item = null;
			items = nextSpread.pageItems.everyItem().getElements();
			while ((item = items.shift())) {
				if (item.itemLayer !== layer) {
					if (item.locked) item.locked = false;
					if (item.name !== '<page label>') item.remove(); // Preserve page labels
				}
			}

			// Remove spread if empty
			if (thisSpread.allPageItems.length === 0 || (thisSpread.allPageItems.length === 1 &&
				thisSpread.pageItems[0].name === '<page label>')) thisSpread.remove();

			// Label spread with layer name
			addSlugInfo(nextSpread, layer.name);

			// Skip nextSpread
			i++;
		}
		// if (layer.allPageItems.length == 0) layer.remove();

		function layerHasItems(/*object*/spread) {
			for (var i = 0, n = spread.pageItems.length; i < n; i++) {
				if (!spread.pageItems.item(i).visible) continue;
				if (spread.pageItems.item(i).itemLayer.name === layer.name) return true;
			}
			return false;
		}

		function addSlugInfo(/*object*/spread, /*string*/label) {
			var infoFrame, infoText;
			var infoLayer = doc.layers.item(layerNames.info[0]);
			var pageMarksHeight = 15 + UnitValue('1 mm').as('pt');
			app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

			// Create or show info layer
			if (infoLayer.isValid) infoLayer.visible = true;
			else doc.layers.add({ name: 'info', layerColor: UIColors.CYAN });
			infoLayer.move(LocationOptions.AT_BEGINNING);

			// Adjust slug
			if (doc.documentPreferences.slugTopOffset < pageMarksHeight +
					doc.documentPreferences.documentBleedTopOffset) {
				doc.documentPreferences.slugTopOffset = pageMarksHeight +
				doc.documentPreferences.documentBleedTopOffset;
			}

			// Add text label
			infoFrame = spread.pageItems.itemByName('<page label>');
			if (infoFrame.isValid) {
				if (infoFrame.contents !== label)
					infoFrame.contents = infoFrame.contents.replace(' ' + label, '') + ' ' + label;
			} else {
				infoFrame = spread.pages[0].textFrames.add({
					itemLayer: infoLayer.name,
					name:      '<page label>',
					bottomLeftCornerOption:  CornerOptions.NONE,
					bottomRightCornerOption: CornerOptions.NONE,
					topLeftCornerOption:     CornerOptions.NONE,
					topRightCornerOption:    CornerOptions.NONE,
					contents: label
				});
				infoText = infoFrame.parentStory.paragraphs.everyItem();
				infoText.properties = {
					appliedFont:    app.fonts.item('Helvetica\tRegular'),
					pointSize:      6,
					fillColor:      'Registration',
					strokeWeight:   '0.4 pt',
					strokeColor:    'Paper',
					capitalization: Capitalization.ALL_CAPS
				};
				infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
				infoFrame.textFramePreferences.properties = {
					verticalJustification:        VerticalJustification.TOP_ALIGN,
					firstBaselineOffset:          FirstBaseline.CAP_HEIGHT,
					autoSizingReferencePoint:     AutoSizingReferenceEnum.TOP_LEFT_POINT,
					autoSizingType:               AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
					useNoLineBreaksForAutoSizing: true
				};
				infoFrame.move([
					spread.pages[0].bounds[1] + 10,
					spread.pages[0].bounds[0] -
						doc.documentPreferences.documentBleedTopOffset -
						UnitValue('1 mm').as('pt') -
						(15 - (infoFrame.geometricBounds[2] - infoFrame.geometricBounds[0])) / 2 -
						(infoFrame.geometricBounds[2] - infoFrame.geometricBounds[0])
				]);
			}
		}
	}
}
