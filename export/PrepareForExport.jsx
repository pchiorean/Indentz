/*
	Prepare for export v2.1.1 (2021-08-16)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Hides some layers and moves special colors to separate spreads.

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
app.scriptPreferences.enableRedraw = false;

// Customizable items
var infoLayer = doc.layers.item("info");
var layerNames = {
	covered:  [ "covered area*" ],
	visible:  [ "visible area", "rahmen", "sicht*", "*vi?ib*", "vis?*" ],
	safe:     [ "safety margins", "safe area", "segmentation" ],
	guides:   [ "guides", "grid", "masuratori" ],
	dielines: [ "dielines", "cut", "cut*line*", "decoupe", "die", "die*cut", "stanz*" ],
	varnish:  [ "varnish", "uv" ],
	foil:     [ "foil", "silver", "silver foil" ],
	white:    [ "white" ]
};
app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, "Prepare for export");

function main() {
	if (!infoLayer.isValid) doc.layers.add({ name: "info", layerColor: UIColors.CYAN })
	else infoLayer.visible = true;
	infoLayer.move(LocationOptions.AT_BEGINNING);

	doc.layers.everyItem().locked = false;

	var matched = { dielines: [], varnish: [], foil: [], white: [] };
	for (var i = 0, n = doc.layers.length, layer; i < n; i++) {
		layer = doc.layers[i];
		for (var variant in layerNames) {
			if (IsIn(layer.name, layerNames[variant], false)) {
				switch (layerNames[variant][0]) {
					case layerNames.covered[0]:
					case layerNames.visible[0]:
					case layerNames.safe[0]:
					case layerNames.guides[0]:
						layer.visible = false;
						break;
					case layerNames.dielines[0]:
						matched.dielines.push(layer);
						layer.visible = true;
						break;
					case layerNames.varnish[0]:
						matched.varnish.push(layer);
						layer.visible = true;
						break;
					case layerNames.foil[0]:
						matched.foil.push(layer);
						layer.visible = true;
						break;
					case layerNames.white[0]:
						matched.white.push(layer);
						layer.visible = true;
						break;
				};
				continue;
			};
		};
	};

	var dieLayerSlug = (matched.varnish.length > 0 || matched.foil.length > 0 || matched.white.length > 0);
	for (var i = 0; i < matched.dielines.length; i++) MoveSpecialColors(matched.dielines[i], dieLayerSlug);
	for (var i = 0; i < matched.varnish.length; i++) MoveSpecialColors(matched.varnish[i], true);
	for (var i = 0; i < matched.foil.length; i++) MoveSpecialColors(matched.foil[i], true);
	for (var i = 0; i < matched.white.length; i++) MoveSpecialColors(matched.white[i], true);
};

// Move all items from 'layer' to a separate spread
function MoveSpecialColors(layer, /*bool*/slug) {
	var thisSpread, nextSpread, obj;
	for (var i = 0, n = doc.spreads.length; i < n; i++) {
		thisSpread = doc.spreads[i];
		if (!LayerHasItems(thisSpread, layer)) continue;
		nextSpread = thisSpread.duplicate(LocationOptions.AFTER, thisSpread);
		// Step 1: Delete items on 'layer' from this spread
		for (var j = 0; j < thisSpread.pageItems.length; j++) {
			obj = thisSpread.pageItems.item(j);
			if (obj.itemLayer.name == layer.name) {
				if (obj.locked) obj.locked = false;
				obj.remove(); j--;
			} else if (obj.name == "<page label>") { obj.remove(); j-- };
		};
		// Step 2: Delete items not on 'layer' from next spread
		for (var j = 0; j < nextSpread.pageItems.length; j++) {
			obj = nextSpread.pageItems.item(j);
			if (obj.itemLayer.name != layer.name) {
				if (obj.locked) obj.locked = false;
				obj.remove(); j--;
			} else if (obj.name == "<page label>") { obj.remove(); j-- };
		};
		if (thisSpread.allPageItems.length == 0) thisSpread.remove();
		if (slug) SlugInfo(nextSpread, layer.name);
		i++;
	};
	// if (layer.allPageItems.length == 0) layer.remove();

	// Check if 'spread' has items on 'layer'
	function LayerHasItems(spread, layer) {
		for (var i = 0, n = spread.pageItems.length; i < n; i++) {
			if (spread.pageItems.item(i).visible == false) continue;
			if (spread.pageItems.item(i).itemLayer.name == layer.name) return true;
		};
	};

	function SlugInfo(spread, name) {
		app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
		if (doc.documentPreferences.slugTopOffset < 9)
			doc.documentPreferences.slugTopOffset = 9 +
			doc.documentPreferences.properties.documentBleedTopOffset;
		var infoFrame, infoText, infoColor;
		infoFrame = spread.pages[0].textFrames.add({
			itemLayer: infoLayer.name,
			name: "<page label>",
			contents: name
		});
		infoText = infoFrame.parentStory.paragraphs.everyItem();
		infoText.properties = {
			appliedFont: app.fonts.item("Helvetica\tRegular"),
			pointSize: 6,
			fillColor: "Registration",
			capitalization: Capitalization.ALL_CAPS
		};
		infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
		infoFrame.textFramePreferences.properties = {
			verticalJustification: VerticalJustification.TOP_ALIGN,
			firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
			autoSizingReferencePoint: AutoSizingReferenceEnum.TOP_LEFT_POINT,
			autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
			useNoLineBreaksForAutoSizing: true
		};
		infoFrame.move([ 10, -4.2 - infoFrame.geometricBounds[2] -
			doc.documentPreferences.properties.documentBleedTopOffset ]);
	};
};

// Modified from FORWARD.Util functions, by Richard Harrington
// https://github.com/richardharrington/indesign-scripts
function IsIn(searchValue, array, caseSensitive) {
	caseSensitive = (typeof caseSensitive !== 'undefined') ? caseSensitive : true;
	var item;
	if (!caseSensitive && typeof searchValue === 'string') searchValue = searchValue.toLowerCase();
	for (var i = 0, n = array.length; i < n; i++) {
		item = array[i];
		if (!caseSensitive && typeof item === 'string') item = item.toLowerCase();
		// if (item === searchValue) return true;
		item = RegExp("^" + item.replace(/\*/g, ".*").replace(/\?/g, ".") + "$", "g");
		if (item.test(searchValue)) return true;
	};
};
