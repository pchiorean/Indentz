/*
	Finishing 0.5.3
	© November 2020, Paul Chiorean
	Used for quick fixes.
*/

if (!(doc = app.activeDocument)) exit();
var page = app.activeWindow.activePage;

app.doScript(
	File(app.activeScript.path + "/../scaling/ScaleToPageMargins.jsx"), ScriptLanguage.javascript,
	undefined, UndoModes.ENTIRE_SCRIPT, "Scale to page margins"
);
app.doScript(
	File(app.activeScript.path + "/../alignment/AlignToB.jsx"), ScriptLanguage.javascript,
	undefined, UndoModes.ENTIRE_SCRIPT, "Align to bottom"
);
app.doScript(
	File(app.activeScript.path + "/../misc/Clip.jsx"), ScriptLanguage.javascript,
	undefined, UndoModes.ENTIRE_SCRIPT, "Clipping"
);
doc.selection[0].geometricBounds = [37.6223012426542,3.00000000000001,46,27];
doc.selection[0].itemLayer = doc.layers.item("Bar Code");
doc.layers.item("Layer 1").remove();


function ExpandItems() {
	var bleed = Bounds(page);
	var item, items = doc.allPageItems;
	while (item = items.shift()) {
		item.redefineScaling();
		switch (item.label) {
			case "bleed":
			case "bg":
				FitForced(item); break;
			case "fit":
			case "expand":
			case "aw":
				FitLax(item); break;
		}
	}
}

function TextReg2CMYK(){
	try { doc.colors.add({
		name: "Reg. black",
		model: ColorModel.PROCESS,
		space: ColorSpace.CMYK,
		colorValue: [100, 100, 100, 100] });
	} catch (_) {};
	app.findTextPreferences = app.changeTextPreferences = NothingEnum.nothing;
	app.findChangeTextOptions.includeHiddenLayers =
	app.findChangeTextOptions.includeLockedLayersForFind =
	app.findChangeTextOptions.includeLockedStoriesForFind =
	app.findChangeTextOptions.includeMasterPages = true;
	app.findTextPreferences.fillColor = "Registration";
	app.changeTextPreferences.fillColor = "Reg. black";
	doc.changeText();
	app.findTextPreferences = app.changeTextPreferences = NothingEnum.nothing;
}

function TextBlack2Black(){
	try { doc.colors.add({
		name: "C=60 M=40 Y=40 K=100",
		model: ColorModel.PROCESS,
		space: ColorSpace.CMYK,
		colorValue: [60, 40, 40, 100] });
	} catch (_) {};
	try { doc.colors.add({
		name: "R=0 G=0 B=0" });
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

function FitLax(obj) {
	// Undo if already clipped
	if ((obj.label == "<clip frame>") && obj.pageItems.length == 0 ) obj.label = "";
	if (obj.label == "<clip frame>" && obj.pageItems[0].isValid) {
		var objD = obj.pageItems[0].duplicate();
		objD.sendToBack(obj); obj.remove(); app.select(objD);
		return;
	}
	// Get target size
	var szOg = obj.geometricBounds;
	var szOv = obj.visibleBounds;
	var szB = Bounds(page);
	var size = [
		szOg[2] > szB[0] ? Math.max(szOv[0], szB[0]) : szOg[0], // top
		szOg[3] > szB[1] ? Math.max(szOv[1], szB[1]) : szOg[1], // left
		szOg[0] < szB[2] ? Math.min(szOv[2], szB[2]) : szOg[2], // bottom
		szOg[1] < szB[3] ? Math.min(szOv[3], szB[3]) : szOg[3]  // right
	];
	if ( // Skip if obj size is smaller than target size
		Number(szOv[0].toFixed(11)) >= Number(size[0].toFixed(11)) &&
		Number(szOv[1].toFixed(11)) >= Number(size[1].toFixed(11)) &&
		Number(szOv[2].toFixed(11)) <= Number(size[2].toFixed(11)) &&
		Number(szOv[3].toFixed(11)) <= Number(size[3].toFixed(11)) &&
		// and is not HW
		(obj.name != "HW" && obj.label != "HW")
	) return;
	// Clipping rectangle properties
	var clipFrameP = {
		label: "<clip frame>", name: "<clip frame>",
		itemLayer: obj.itemLayer,
		fillColor: "None", strokeColor: "None",
		geometricBounds: size
	}
	// Case 1: Simple rectangles
	if (obj.constructor.name == "Rectangle" &&
		obj.strokeWeight <= 1 &&
		(obj.absoluteRotationAngle == 0 ||
		Math.abs(obj.absoluteRotationAngle) == 90 ||
		Math.abs(obj.absoluteRotationAngle) == 180)) {
		// HW is a special case
		if (obj.name == "HW" || obj.label == "HW") {
			obj.geometricBounds = [
				(page.bounds[2] - page.bounds[0]) * 0.9,
				szB[1], szB[2], szB[3]
			];
			return;
		} else { obj.geometricBounds = size; return };
	}
	// Case 2: Text frames
	if (obj.constructor.name == "TextFrame" &&
		(obj.absoluteRotationAngle == 0 ||
		Math.abs(obj.absoluteRotationAngle) == 90 ||
		Math.abs(obj.absoluteRotationAngle) == 180)) {
			obj.geometricBounds = size; return;
	}
	// Case 3: Orthogonal lines
	if (obj.constructor.name == "GraphicLine" && (szOg[0] == szOg[2]) || (szOg[1] == szOg[3])) {
		// Make temp rectangle and resolve TL-BR
		var frame = page.rectangles.add(clipFrameP);
		var frame_TL = frame.resolve(AnchorPoint.TOP_LEFT_ANCHOR, 
			CoordinateSpaces.SPREAD_COORDINATES)[0];
		var frame_BR = frame.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, 
			CoordinateSpaces.SPREAD_COORDINATES)[0];
		frame.remove(); // Remove temp rectangle
		if ( // Skip if obj size is smaller than target size
			Number(size[0].toFixed(11)) <= Number(frame_TL[1].toFixed(11)) &&
			Number(size[1].toFixed(11)) <= Number(frame_TL[0].toFixed(11)) &&
			Number(size[2].toFixed(11)) >= Number(frame_BR[3].toFixed(11)) &&
			Number(size[3].toFixed(11)) >= Number(frame_BR[2].toFixed(11))
		) return;
		if (obj.endCap != 1919115632) { // If endcap is round, skip
			obj.reframe(CoordinateSpaces.SPREAD_COORDINATES, [frame_TL, frame_BR]);
			return;
		}
	}
	// Other cases: Containment
	var frame = page.rectangles.add(clipFrameP); // Make clipping rectangle
	frame.sendToBack(obj);
	app.select(obj); app.cut();
	app.select(frame); app.pasteInto();
}

function FitForced(obj) {
	// Undo if already clipped
	if ((obj.label == "<clip frame>" || obj.name == "<clip frame>") &&
		obj.pageItems.length == 0 ) { obj.label = ""; obj.name = "" };
	if (obj.label == "<clip frame>" && obj.pageItems[0].isValid) {
		var objD = obj.pageItems[0].duplicate();
		objD.sendToBack(obj); obj.remove(); app.select(objD);
		return;
	}
	// Get target size
	var size = Bounds(page);
	// Clipping rectangle properties
	var clipFrameP = {
		label: "<clip frame>", name: "<clip frame>",
		itemLayer: obj.itemLayer,
		fillColor: "None", strokeColor: "None",
		geometricBounds: size
	}
	// Case 1: Simple rectangles
	if (obj.constructor.name == "Rectangle" &&
		// obj.strokeWeight == 0 &&
		(obj.absoluteRotationAngle == 0 ||
		Math.abs(obj.absoluteRotationAngle) == 90 ||
		Math.abs(obj.absoluteRotationAngle) == 180)) {
		// HW is a special case
		if (obj.name == "HW" || obj.label == "HW") {
			obj.geometricBounds = [
				(page.bounds[2] - page.bounds[0]) * 0.9,
				size[1], size[2], size[3]
			];
			return;
		} else { obj.geometricBounds = size; return };
	}
	// Case 2: Groups
	if (obj.constructor.name == "Group") {
		var frame = page.rectangles.add(clipFrameP); // Make clipping rectangle
		frame.sendToBack(obj);
		app.select(obj); app.cut();
		app.select(frame); app.pasteInto();
	}
}

function Bounds(page) { // Return page bleed bounds
	var fPg = page.parent.pages.firstItem();
	var lPg = page.parent.pages.lastItem();
	var bleed = {
		top: doc.documentPreferences.properties.documentBleedTopOffset,
		left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
		bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
		right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
	}
	var size = [ // Default is middle page
		page.bounds[0] - bleed.top,
		page.bounds[1],
		page.bounds[2] + bleed.bottom,
		page.bounds[3]
	];
	if (page.parent.pages.length == 1) { // Spread is single page
		// Reverse left and right margins if left-hand page
		if (fPg.side == PageSideOptions.LEFT_HAND) {
			bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
			bleed.right = doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
		}
		size[1] -= bleed.left;
		size[3] += bleed.right;
	} else { // Spread is multiple pages
		switch (page) {
			case fPg:
				// Reverse left and right margins if left-hand page
				if (fPg.side == PageSideOptions.LEFT_HAND) {
					bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
				}
				size[1] -= bleed.left; break;
			case lPg:
				size[3] += bleed.right; break;
		}
	}
	return size;
}