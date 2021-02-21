/*
	Finishing 0.5.4
	© February 2021, Paul Chiorean
	Used for quick fixes.
*/

if (!(doc = app.activeDocument)) exit();
var page = app.activeWindow.activePage;

var SCOPE;
var TARGET;
var FORCED_FIT;

// @include "../lib/FitTo.jsxinc";
// @include "../lib/bounds.jsxinc";

// app.doScript(File(app.activeScript.path + "/../scaling/ScaleToPageMargins.jsx"),
// 	ScriptLanguage.javascript, undefined,
// 	UndoModes.ENTIRE_SCRIPT, "Scale to page margins");
// app.doScript(File(app.activeScript.path + "/../alignment/AlignToB.jsx"),
// 	ScriptLanguage.javascript, undefined,
// 	UndoModes.ENTIRE_SCRIPT, "Align to bottom");
// app.doScript(File(app.activeScript.path + "/../misc/Clip.jsx"),
// 	ScriptLanguage.javascript, undefined,
// 	UndoModes.ENTIRE_SCRIPT, "Clipping");
// doc.selection[0].geometricBounds = [37.6223012426542,3.00000000000001,46,27];
// doc.selection[0].itemLayer = doc.layers.item("Bar Code");
// doc.layers.item("Layer 1").remove();

try { doc.colors.add({
	name: "C=60 M=40 Y=40 K=100",
	model: ColorModel.PROCESS,
	space: ColorSpace.CMYK,
	colorValue: [60, 40, 40, 100] });
} catch (_) {};
var item, items = doc.rectangles.everyItem().getElements();
while (item = items.shift()) {
	if (item.fillColor.colorValue.join(",") == "100,100,100,100")
		item.fillColor = "C=60 M=40 Y=40 K=100";
}


function ExpandItems() {
	var item, items = doc.allPageItems;
	while (item = items.shift()) {
		item.redefineScaling();
		switch (item.label) {
			case "fit":
				SCOPE = "page";
				TARGET = null;
				FORCED_FIT = false;
				app.select(item);
				app.doScript(main, ScriptLanguage.javascript, undefined,
				UndoModes.ENTIRE_SCRIPT, "Resize to page");
				break;
			case "bleed":
				SCOPE = "spread";
				TARGET = "bleed";
				FORCED_FIT = true;
				app.select(item);
				app.doScript(main, ScriptLanguage.javascript, undefined,
				UndoModes.ENTIRE_SCRIPT, "Resize to spread bleed");
				break;
		}
	}
	app.select(null);
}

function TextRGBBlack2CMYKBlack() {
	// try { doc.colors.add({
	// 	name: "C=60 M=40 Y=40 K=100",
	// 	model: ColorModel.PROCESS,
	// 	space: ColorSpace.CMYK,
	// 	colorValue: [60, 40, 40, 100] });
	// } catch (_) {};
	try { doc.colors.add({
		name: "R=0 G=0 B=0",
		model: ColorModel.PROCESS,
		space: ColorSpace.RGB,
		colorValue: [0, 0, 0] });
} catch (_) {
		app.findTextPreferences = app.changeTextPreferences = NothingEnum.nothing;
		app.findChangeTextOptions.includeHiddenLayers =
		app.findChangeTextOptions.includeLockedLayersForFind =
		app.findChangeTextOptions.includeLockedStoriesForFind =
		app.findChangeTextOptions.includeMasterPages = true;
		app.findTextPreferences.fillColor = "R=0 G=0 B=0";
		app.changeTextPreferences.fillColor = "Black";
		// app.changeTextPreferences.fillColor = "C=60 M=40 Y=40 K=100";
		doc.changeText();
		app.findTextPreferences = app.changeTextPreferences = NothingEnum.nothing;
	}
}

function Relink(oldLink, newLink) {
	for (var i = 0; i < doc.links.length; i++) {
		var link = doc.links[i];
		if (link.name == oldLink) link.relink(File(doc.filePath + "/Links/" + newLink));
	}
}
