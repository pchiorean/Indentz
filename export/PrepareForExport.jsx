/*
	Prepare for export v1.12 (2021-04-14)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Hides visible area layer and moves white, varnish & dielines to separate spreads.

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

var visLayer = FindLayer([
	"visible area",
	"visible", "Visible",
	"vizibil", "Vizibil",
	"vis. area", "Vis. area"
]);
var saLayer = FindLayer([ "safe area" ]);
var dieLayer = FindLayer([
	"dielines",
	"cut lines", "Cut lines", "cut", "Cut", "CUT",
	"decoupe", "Decoupe",
	"die", "Die", "die cut", "Die Cut", "diecut", "Diecut",
	"stanz", "Stanz", "stanze", "Stanze",
	"stanzform", "Stanzform"
]);
var whiteLayer = FindLayer([ "white", "White", "WHITE" ]);
var uvLayer = FindLayer([ "varnish", "Varnish", "UV" ]);
var guidesLayer = FindLayer([ "guides", "Guides" ]);
var infoLayer = doc.layers.item("info");
if (!infoLayer.isValid) doc.layers.add({ name: "info", layerColor: UIColors.CYAN });
infoLayer.move(LocationOptions.AT_BEGINNING);

doc.layers.everyItem().locked = false;
try { visLayer.visible = false } catch (_) {};
try { saLayer.visible = false } catch (_) {};
try { dieLayer.visible = true } catch (_) {};
try { whiteLayer.visible = true } catch (_) {};
try { uvLayer.visible = true } catch (_) {};
try { guidesLayer.visible = false } catch (_) {};
try { infoLayer.visible = true } catch (_) {};

if (uvLayer != null) { app.doScript(main, ScriptLanguage.JAVASCRIPT,
	[ uvLayer, true ], UndoModes.ENTIRE_SCRIPT, uvLayer.name) };
if (whiteLayer != null) { app.doScript(main, ScriptLanguage.JAVASCRIPT,
	[ whiteLayer, true ], UndoModes.ENTIRE_SCRIPT, whiteLayer.name) };
if (dieLayer != null) { app.doScript(main, ScriptLanguage.JAVASCRIPT,
	[ dieLayer, false ], UndoModes.ENTIRE_SCRIPT, dieLayer.name) };


// Move items from 'layer' to separate spread(s)
function main(args) {
	var layer = args[0], flgSlugInfo = args[1];
	var thisSpread, nextSpread, obj;
	for (var i = 0; i < doc.spreads.length; i++) {
		thisSpread = doc.spreads[i];
		if (!LayerHasItems(thisSpread, layer)) continue;
		nextSpread = thisSpread.duplicate(LocationOptions.AFTER, thisSpread);
		// Step 1: Delete items on 'layer' from this spread
		for (var j = 0; j < thisSpread.pageItems.length; j++) {
			obj = thisSpread.pageItems.item(j);
			if (obj.itemLayer.name == layer.name) {
				if (obj.locked) obj.locked = false;
				obj.remove(); j--;
			} else if (obj.label == "spotinfo") { obj.remove(); j-- };
		}
		// Step 2: Delete items not on 'layer' from next spread
		for (var j = 0; j < nextSpread.pageItems.length; j++) {
			obj = nextSpread.pageItems.item(j);
			if (obj.itemLayer.name != layer.name) {
				if (obj.locked) obj.locked = false;
				obj.remove(); j--;
			} else if (obj.label == "spotinfo") { obj.remove(); j-- };
		}
		if (thisSpread.pageItems.length == 0) thisSpread.remove();
		if (flgSlugInfo) SlugInfo(nextSpread, layer.name);
		i++;
	}

	// Check if 'layer' has items on 'spread'
	function LayerHasItems(spread, layer) {
		for (var i = 0; i < spread.pageItems.length; i++) {
			if (spread.pageItems.item(i).itemLayer.name == layer.name) return true;
		}
	}

	function SlugInfo(spread, name) {
		app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
		if (doc.documentPreferences.slugTopOffset < 9)
			doc.documentPreferences.slugTopOffset = 9 +
			doc.documentPreferences.properties.documentBleedTopOffset;

		// spread.activeLayer = infoLayer;
		var infoFrame, infoText, infoColor;
		infoFrame = spread.pages[0].textFrames.add({
			itemLayer: infoLayer.name,
			label: "spotinfo",
			contents: name
		});
		infoText = infoFrame.parentStory.paragraphs.everyItem();
		infoText.properties = {
			appliedFont: app.fonts.item("Helvetica\tRegular"),
			pointSize: 6,
			fillColor: "Registration",
			capitalization: Capitalization.ALL_CAPS
		}
		infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
		infoFrame.textFramePreferences.properties = {
			verticalJustification: VerticalJustification.TOP_ALIGN,
			firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
			autoSizingReferencePoint: AutoSizingReferenceEnum.TOP_LEFT_POINT,
			autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
			useNoLineBreaksForAutoSizing: true
		}
		infoFrame.move([ 10, -4.2 - infoFrame.geometricBounds[2] -
			doc.documentPreferences.properties.documentBleedTopOffset ]);
	}
}

function FindLayer(names) { // Find first layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return layer;
	}
}
