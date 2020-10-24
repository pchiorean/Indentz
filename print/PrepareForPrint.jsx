/*
	Prepare for print v1.8.1
	© October 2020, Paul Chiorean
	Hides "safe area" layer and moves white, varnish & dielines to separate spreads.
*/

if (app.documents.length == 0) exit();
app.scriptPreferences.enableRedraw = false;
var doc = app.activeDocument;

app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
if (doc.documentPreferences.slugTopOffset < 9)
	doc.documentPreferences.slugTopOffset = 9 +
	doc.documentPreferences.properties.documentBleedTopOffset;

var saLayer = FindLayer(["safe area", "visible", "Visible", "vizibil", "Vizibil"]);
var dieLayer = FindLayer(["dielines", "cut lines", "Cut lines", "cut", "Cut", "CUT", "decoupe", "Decoupe", "die cut", "Die Cut", "Die", "diecut", "Diecut", "stanz", "Stanz", "stanze", "Stanze", "stanzform", "Stanzform"]);
var whiteLayer = FindLayer(["white", "White", "WHITE"]);
var uvLayer = FindLayer(["varnish", "Varnish", "UV"]);
var infoLayer = doc.layers.item("info");
if (!infoLayer.isValid) doc.layers.add({ name: "info", layerColor: UIColors.CYAN });
infoLayer.move(LocationOptions.AT_BEGINNING);

doc.layers.everyItem().locked = false;
try { saLayer.visible = false } catch (_) {};
try { dieLayer.visible = true } catch (_) {};
try { whiteLayer.visible = true } catch (_) {};
try { uvLayer.visible = true } catch (_) {};
try { infoLayer.visible = true } catch (_) {};

if (dieLayer != null) {
	app.doScript(Prepare4Print, ScriptLanguage.JAVASCRIPT, dieLayer,
	UndoModes.FAST_ENTIRE_SCRIPT, dieLayer.name) };
if (whiteLayer != null) {
	app.doScript(Prepare4Print, ScriptLanguage.JAVASCRIPT, whiteLayer,
	UndoModes.FAST_ENTIRE_SCRIPT, whiteLayer.name) };
if (uvLayer != null) {
	app.doScript(Prepare4Print, ScriptLanguage.JAVASCRIPT, uvLayer,
	UndoModes.FAST_ENTIRE_SCRIPT, uvLayer.name) };


function Prepare4Print(layer) { // Move items on 'layer' to separate spread(s)
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
			}
		}
		// Step 2: Delete items not on 'layer' from next spread
		for (var j = 0; j < nextSpread.pageItems.length; j++) {
			obj = nextSpread.pageItems.item(j);
			if (obj.itemLayer.name !== layer.name) {
				if (obj.locked) obj.locked = false;
				obj.remove(); j--;
			}
		}
		if (thisSpread.pageItems.length == 0) thisSpread.remove();
		DrawInfoBox(nextSpread, layer.name);
		i++;
	}
}

function DrawInfoBox(spread, name) {
	// spread.activeLayer = infoLayer;
	var infoFrame, infoText, infoColor;
	infoFrame = spread.pages[0].textFrames.add({
		itemLayer: infoLayer.name,
		label: "info",
		contents: name
	});
	infoText = infoFrame.parentStory.paragraphs.everyItem();
	infoText.properties = {
		appliedFont: app.fonts.item("Helvetica\tRegular"),
		pointSize: 6,
		fillColor: /* spread.pages[0].pageItems[0].fillColor.name == "None" ?
		(spread.pages[0].pageItems[0].strokeColor.name == "None" ?
		"Registration" : spread.pages[0].pageItems[0].strokeColor) :
		spread.pages[0].pageItems[0].fillColor */ "Registration",
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
	infoFrame.move([10, -4.2 - infoFrame.geometricBounds[2] -
		doc.documentPreferences.properties.documentBleedTopOffset]);
}

function FindLayer(names) { // Find first layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return layer;
	}
}

function LayerHasItems(spread, layer) { // Check if 'layer' has items on 'spread'
	for (var i = 0; i < spread.pageItems.length; i++) {
		if (spread.pageItems.item(i).itemLayer.name == layer.name) return true;
	}
}
