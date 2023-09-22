/*
	Layers to spreads 23.9.22
	(c) 2022-2023 Paul Chiorean <jpeg@basement.ro>

	Moves layers of the active document to separate spreads.

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

if (!(doc = app.activeDocument)) exit();
if (doc.layers.length === 1) { alert('Document has only one layer.'); exit(); }
if (doc.spreads.length > 1) { alert('Document has more than one spread.'); exit(); }

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Layers to spreads');

function main() {
	var i, item, items, guide, guides, layer, targetSpread;
	var sourceSpread = doc.spreads[0];
	var infoLayer = doc.layers.item('info');
	app.scriptPreferences.enableRedraw = false;

	if (infoLayer.isValid) {
		infoLayer.visible = true;
	} else {
		doc.layers.add({ name: 'info', layerColor: UIColors.CYAN });
		infoLayer.move(LocationOptions.AT_BEGINNING);
	}

	doc.layers.everyItem().locked = false;

	for (i = doc.layers.length - 1; i >= 0; i--) {
		layer = doc.layers[i];
		if (layer.name === 'info' && layer.allPageItems.length === 0) continue;
		if (!layerHasItems(sourceSpread)) continue;

		targetSpread = sourceSpread.duplicate(LocationOptions.AT_END);
		items = sourceSpread.pageItems.everyItem().getElements();
		while ((item = items.shift()))
			if (item.itemLayer === layer) { if (item.locked) item.locked = false; item.remove(); }
		items = targetSpread.pageItems.everyItem().getElements();
		while ((item = items.shift()))
			if (item.itemLayer !== layer) { if (item.locked) item.locked = false; item.remove(); }
		guides = targetSpread.guides.everyItem().getElements();
		while ((guide = guides.shift()))
			if (guide.itemLayer !== layer) { if (guide.locked) guide.locked = false; guide.remove(); }

		slugInfo(targetSpread, layer.name);
	}

	sourceSpread.remove();

	function slugInfo(/*object*/spread, /*string*/label) {
		var infoFrame, infoText;
		var pageMarksHeight = 15 + UnitValue('1 mm').as('pt');
		app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

		if (doc.documentPreferences.slugTopOffset < pageMarksHeight
				+ doc.documentPreferences.documentBleedTopOffset) {
			doc.documentPreferences.slugTopOffset = pageMarksHeight
				+ doc.documentPreferences.documentBleedTopOffset;
		}

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

	function layerHasItems(/*object*/spread) {
		for (var i = 0; i < spread.pageItems.length; i++) {
			if (!spread.pageItems.item(i).visible) continue;
			if (spread.pageItems.item(i).itemLayer.name === layer.name) return true;
		}
		return false;
	}
}
