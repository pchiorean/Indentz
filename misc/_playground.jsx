/*
	BatchResize v1.6.0-beta
	Automates the resizing of a master based on a size table.

	A modified version of Redimensionari v7 by Dan Ichimescu, 22 April 2020
	September 2020, Paul Chiorean
*/

#target indesign
if (app.documents.length == 0) exit();
var doc = app.activeDocument;

// Step 0. Initialisation
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.scriptPreferences.enableRedraw = false;
var masterPath = doc.filePath;
var masterFN = masterPath + "/" + doc.name.substr(0, doc.name.lastIndexOf("."));
var masterFile = File(masterFN + ".indd");
// Customizable items
var safeLayerName = FindLayer(["safe area", "vizibil", "Vizibil"]);
var infoLayerName = FindLayer(["info", "Info"]);
var idLayerName = FindLayer(["id", "ID"]);
var safeSwatchName = "Safe area";

// Step 1. Check and parse info file
var infoFile = File(masterFN + ".txt");
if (!infoFile.open("r")) { alert("File \'" + infoFile.name + "\' not found."); exit() };
var infoLine, infoID = [], infoS = [], infoT = [], infoVL = [], infoFN = [];
var header = infoFile.readln().split("\t");
var line = 0;
while (!infoFile.eof) {
	infoLine = infoFile.readln().split("\t"); line++;
	if (!infoLine[3] || !infoLine[4] || !infoLine[7]) {
		alert ("Missing data in record " + line + "."); exit();
	}
	infoID[line] = infoLine[0]; // ID
	// Workaround for missing safe area
	if (!infoLine[1]) infoLine[1] = infoLine[3];
	if (!infoLine[2]) infoLine[2] = infoLine[4];
	infoS[line] = { // Safe area
		width: Number(infoLine[1].replace(/\,/g, ".")) / 0.352777777777778,
		height: Number(infoLine[2].replace(/\,/g, ".")) / 0.352777777777778
	}
	infoT[line] = { // Total size
		width: Number(infoLine[3].replace(/\,/g, ".")) / 0.352777777777778,
		height: Number(infoLine[4].replace(/\,/g, ".")) / 0.352777777777778
	}
	infoVL[line] = infoLine[6]; // Layout
	infoFN[line] = infoLine[7]; // Filename
}
infoFile.close();
var records = line; if (records < 1) { alert ("Not enough records found."); exit() };
var layouts = Unique(infoVL); // Layouts array

// Step 2. Options dialog
var win = new Window("dialog", "Batch Resize");
win.orientation = "row";
win.alignChildren = ["left","top"];
win.main = win.add("group", undefined);
win.main.orientation = "column";
win.main.alignChildren = "fill";
win.main.preferredSize.width = 255;
win.gStats = win.main.add("panel", undefined, "File: " + infoFile.name);
win.gStats.orientation = "row";
win.gStats.alignChildren = ["left", "center"];
win.gStats.margins = [10,15,10,10];
win.gStats.g1 = win.gStats.add("group", undefined);
win.gStats.g1.st1 = win.gStats.g1.add("statictext", undefined, "Records:");
win.gStats.g1.et1 = win.gStats.g1.add('edittext {justify: "center", properties: {readonly: true}}');
win.gStats.g1.et1.preferredSize.width = 43;
win.gStats.g1.et1.text = records;
win.gStats.g2 = win.gStats.add("group", undefined);
win.gStats.g2.divider = win.gStats.g2.add("panel", undefined, undefined);
win.gStats.g2.divider.alignment = "fill";
win.gStats.g2.st2 = win.gStats.g2.add("statictext", undefined, "Layouts:");
win.gStats.g2.et2 = win.gStats.g2.add('edittext {justify: "center", properties: {readonly: true}}');
win.gStats.g2.et2.preferredSize.width = 30;
win.gStats.g2.et2.text = layouts.length;
win.gOptions = win.main.add("panel", undefined, "Options");
win.gOptions.orientation = "column";
win.gOptions.alignChildren = ["left", "center"];
win.gOptions.spacing = 5;
win.gOptions.margins = [10,15,10,5];
win.gOptions.cb1 = win.gOptions.add("checkbox", undefined, "Display ID on bottom-left corner");
win.gOptions.cb1.value = true;
win.gOptions.cb2 = win.gOptions.add("checkbox", undefined, "Remove unused layouts");
win.gOptions.cb2.enabled = (layouts.length > 0);
win.gOptions.cb2.value = true;
win.gOptions.cb3 = win.gOptions.add("checkbox", undefined, "Align labeled elements");
win.gOptions.cb3.value = true;
win.gOkCancel = win.add("group", undefined);
win.gOkCancel.orientation = "column";
win.gOkCancel.alignChildren = "fill";
win.gOkCancel.ok = win.gOkCancel.add("button", undefined, "Start", {name: "ok"});
win.gOkCancel.cancel = win.gOkCancel.add("button", undefined, "Cancel", {name: "cancel"});
if (win.show() == 2) exit();

// Step 3. Master file
var timer = {
	setStartTime: function (){ d = new Date(); time = d.getTime() },
	getDiff: function (){ d = new Date(); t = d.getTime() - time; time = d.getTime(); return t }
}
timer.setStartTime();
var ratios = SortPagesByRatio();
if(doc.modified == true) doc.save(masterFile); doc.close();
var doc = app.open(masterFile, false);

// Step 4. Batch processing
var progressBar = new ProgressBar(); progressBar.reset(records);
for (line = 1; line <= records; line++) {
	// Find page with closest ratio; create folder; save a copy; purge pages
	var targetPage = GetPage();
	var targetFolder = Folder(masterPath + "/" + ("ratio " + (ratios[targetPage].toFixed(2))));
	targetFolder.create();
	var targetFile = File(targetFolder + "/" + infoFN[line] + ".indd");
	doc.saveACopy(targetFile);
	var target = app.open(targetFile, false);
	for (var i = target.pages.length - 1; i >= 0; i--) {
		if ((i > targetPage) || (i < targetPage)) target.pages[i].remove();
	}
	// target.save();
	// Process target
	target.layers.everyItem().locked = false;
	if (layouts.length > 0 || infoVL[line] != "") SetLayout(infoVL[line]);
	if (win.gOptions.cb3.value == true) PrepareLabeledItems();
	var flg_SA = SetGeometry(); // This flag is used for info box
	if (win.gOptions.cb3.value == true) AlignLabeledItems();
	if (win.gOptions.cb1.value == true &&
		infoID[line] != "" && infoID[line] != "noid" ) DrawIDBox();
	DrawInfoBox();
	target.save(targetFile).close();
	progressBar.update(line);
}
progressBar.close();
infoFile.close();
doc.close(SaveOptions.NO);
alert("Elapsed time: " + (timer.getDiff() / 1000).toFixed(1) + " seconds.");


// Functions
function SetGeometry() {
	target.pages[0].marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
	// Scale visual to safe area
	target.pages[0].layoutRule = LayoutRuleOptions.SCALE;
	target.pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
		AnchorPoint.CENTER_ANCHOR,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
		[infoS[line].width, infoS[line].height]);
	// Extend page to total area
	target.pages[0].layoutRule = LayoutRuleOptions.OFF;
	target.pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
		AnchorPoint.CENTER_ANCHOR,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
		[infoT[line].width, infoT[line].height]);
	// Redefine scaling to 100%
	var item, items = target.allPageItems;
	while (item = items.shift()) item.redefineScaling();
	// Set margins and, if needed, draw safe area frame
	var mgPg = {
		top: (infoT[line].height - infoS[line].height) / 2,
		left: (infoT[line].width - infoS[line].width) / 2,
		bottom: (infoT[line].height - infoS[line].height) / 2,
		right: (infoT[line].width - infoS[line].width) / 2
	};
	if (mgPg.top + mgPg.left + mgPg.bottom + mgPg.right == 0) return false; // If no margins, return
	target.pages[0].marginPreferences.properties = mgPg;
	DrawSafeArea([mgPg.top, mgPg.left, mgPg.top + infoS[line].height, mgPg.left + infoS[line].width]);
	return true;
}

function DrawSafeArea(bounds) {
	// Make swatch
	var safeSwatch = target.swatches.itemByName(safeSwatchName);
	if (!safeSwatch.isValid) {
		target.colors.add({ name: safeSwatchName, model: ColorModel.PROCESS,
		space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] });
	}
	// Make layer
	var safeLayer = target.layers.item(safeLayerName);
	if (!safeLayer.isValid) target.layers.add({ name: safeLayerName, layerColor: UIColors.YELLOW });
	safeLayer.move(LocationOptions.AT_BEGINNING);
	target.activeLayer = safeLayer;
	// Draw frame
	var safeLayerFrame = target.pages[0].rectangles.add({
		label: "safe area",
		contentType: ContentType.UNASSIGNED,
		fillColor: "None",
		strokeColor: safeSwatchName,
		strokeWeight: "0.75pt",
		strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
		strokeType: "$ID/Canned Dashed 3x2",
		overprintStroke: false
	});
	safeLayerFrame.itemLayer = safeLayer.name;
	safeLayerFrame.geometricBounds = bounds;
	safeLayer.properties = { visible: true, locked: true };
}

function SetLayout(layout) {
	var l = target.layers.item(layout);
	if (l.isValid) { l.visible = true } else return;
	for (var i = 0; i < layouts.length; i++) {
		var r = target.layers.item(layouts[i]);
		if (r.isValid && r != l) (win.gOptions.cb2.value == true ? r.remove() : r.visible = false);
	}
}

function DrawIDBox() {
	// Make layer
	var idLayer = target.layers.item(idLayerName);
	if (!idLayer.isValid) target.layers.add({ name: idLayerName, layerColor: UIColors.CYAN });
	try { idLayer.move(LocationOptions.AFTER, target.layers.item(safeLayerName)) } catch (_) {
		idLayer.move(LocationOptions.AT_BEGINNING);
	};
	target.activeLayer = idLayer;
	// Draw ID box
	var infoFrame, infoText;
	infoFrame = target.pages[0].textFrames.add();
	infoFrame.itemLayer = idLayer.name;
	infoFrame.label = "ID";
	infoFrame.contents = header[0] + " " + infoID[line];
	infoText = infoFrame.parentStory.paragraphs.everyItem();
	infoText.appliedFont = app.fonts.item("Helvetica Neue\tRegular");
	infoText.pointSize = 5;
	infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
	infoFrame.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.BOTTOM_ALIGN,
		autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		useNoLineBreaksForAutoSizing: true,
		insetSpacing: [0, 5.669, 5.669, 0]
	}
	infoFrame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
	// If possible, put ID outside safe area
	var szIf = {
		width: infoFrame.geometricBounds[3] - infoFrame.geometricBounds[1],
		height: infoFrame.geometricBounds[2] - infoFrame.geometricBounds[0]
	}
	var szMg = {
		width: (infoT[line].width - infoS[line].width) / 2,
		height: (infoT[line].height - infoS[line].height) / 2
	}
	if ((szMg.height >= szIf.height) || (szMg.width >= szIf.width)) {
		infoFrame.move([0, infoT[line].height - szIf.height]);
	} else {
		infoFrame.move([szMg.width, szMg.height + infoS[line].height - szIf.height]);
	}
	idLayer.properties = { visible: win.gOptions.cb1.value, locked: true };
}

function DrawInfoBox() {
	// Make layer
	var infoLayer = target.layers.item(infoLayerName);
	if (!infoLayer.isValid) target.layers.add({ name: infoLayerName, layerColor: UIColors.CYAN });
	try { infoLayer.move(LocationOptions.AFTER, target.layers.item(idLayerName)) } catch (_) {
		try { infoLayer.move(LocationOptions.AFTER, target.layers.item(safeLayerName)) } catch (_) {
			infoLayer.move(LocationOptions.AT_BEGINNING);
		}
	}
	target.activeLayer = infoLayer;
	// Draw info box
	var infoFrame, infoText;
	infoFrame = target.pages[0].textFrames.add();
	infoFrame.itemLayer = infoLayer.name;
	infoFrame.label = "info";
	infoFrame.contents =
		"Size: " + (infoT[line].width * 0.352777777777778) + "x" + (infoT[line].height * 0.352777777777778) +
		(flg_SA ? "_" + (infoS[line].width * 0.352777777777778) + "x" + (infoS[line].height * 0.352777777777778) : "") +
		" / Ratio: " + (infoS[line].width / infoS[line].height).toFixed(3) +
		(infoVL[line] ? " / Layout: " + infoVL[line] : "");
	infoText = infoFrame.parentStory.paragraphs.everyItem();
	infoText.appliedFont = app.fonts.item("Helvetica Neue\tRegular");
	infoText.pointSize = 5;
	infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
	infoFrame.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.TOP_ALIGN,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.TOP_LEFT_POINT,
		autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
		useNoLineBreaksForAutoSizing: true,
		insetSpacing: [2.83464566929134, 2.83464566929134, 0, 0]
	}
	infoFrame.move([0, infoT[line].height + target.documentPreferences.properties.documentBleedBottomOffset]);
	infoLayer.properties = { visible: true, locked: true };
}

function PrepareLabeledItems() {
	var obj = target.pageItems.everyItem().getElements();
	for (var i = 0; i < obj.length; i++) {
		if (/scale|alignL|alignTL|alignBL|alignR|alignTR|alignBR|alignT|alignTL|alignTR|alignB|alignBL|alignBR/ig.test(obj[i].label)) {
			var align = target.groups.add([
				obj[i],
				target.rectangles.add({
					label: "<align>", name: "<align>",
					itemLayer: obj[i].itemLayer,
					fillColor: "None", strokeColor: "None",
					geometricBounds: obj[i].parentPage.bounds
				})
			]);
			align.label = obj[i].label;
		}
	}
}

function AlignLabeledItems() {
	var obj = target.pageItems.everyItem().getElements();
	var page = target.pages[0];
	var bleed = BleedBounds(page);
	for (var i = 0; i < obj.length; i++) {
		var oLabel = obj[i].label;
		if (/scale|alignL|alignTL|alignBL|alignR|alignTR|alignBR|alignT|alignTL|alignTR|alignB|alignBL|alignBR/ig.test(oLabel)) {
			if (oLabel == "scale") {
				var objSF = Math.max(
					(infoS[line].width) / (obj[i].visibleBounds[3] - obj[i].visibleBounds[1]),
					(infoS[line].height) / (obj[i].visibleBounds[2] - obj[i].visibleBounds[0])
				);
				var matrix = app.transformationMatrices.add({ horizontalScaleFactor: objSF, verticalScaleFactor: objSF });
				obj[i].transform(CoordinateSpaces.PASTEBOARD_COORDINATES, AnchorPoint.CENTER_ANCHOR, matrix);
			}
			if (oLabel == "alignL" || oLabel == "alignTL" || oLabel == "alignBL")
				target.align(obj[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
			if (oLabel == "alignR" || oLabel == "alignTR" || oLabel == "alignBR")
				target.align(obj[i], AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
			if (oLabel == "alignT" || oLabel == "alignTL" || oLabel == "alignTR")
				target.align(obj[i], AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
			if (oLabel == "alignB" || oLabel == "alignBL" || oLabel == "alignBR")
				target.align(obj[i], AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
			obj[i].ungroup(); target.rectangles.itemByName("<align>").remove();
		} else {
			switch (oLabel) {
				case "bleed":
					if (obj[i].constructor.name == "Rectangle" &&
						(obj[i].absoluteRotationAngle == 0 ||
						Math.abs(obj[i].absoluteRotationAngle) == 90 ||
						Math.abs(obj[i].absoluteRotationAngle) == 180)) {
							obj[i].geometricBounds = bleed;
					}
					if (obj[i].constructor.name == "Group") {
						var frame = page.rectangles.add({
							label: "<clip group>", name: "<clip group>",
							itemLayer: obj[i].itemLayer,
							fillColor: "None", strokeColor: "None",
							geometricBounds: bleed
						});
						frame.sendToBack(obj[i]);
						app.select(obj[i]); app.cut();
						app.select(frame); app.pasteInto();
					}
					break;
				case "fit":
					obj[i].fit(FitOptions.FRAME_TO_CONTENT);
					var szOg = obj[i].geometricBounds;
					var szOv = obj[i].visibleBounds;
					var size = [
						szOg[2] > bleed[0] ? Math.max(szOv[0], bleed[0]) : szOg[0], // top
						szOg[3] > bleed[1] ? Math.max(szOv[1], bleed[1]) : szOg[1], // left
						szOg[0] < bleed[2] ? Math.min(szOv[2], bleed[2]) : szOg[2], // bottom
						szOg[1] < bleed[3] ? Math.min(szOv[3], bleed[3]) : szOg[3]  // right
					];
					if ( // Skip if obj size is smaller than target size
						Number(szOv[0].toFixed(11)) >= Number(bleed[0].toFixed(11)) &&
						Number(szOv[1].toFixed(11)) >= Number(bleed[1].toFixed(11)) &&
						Number(szOv[2].toFixed(11)) <= Number(bleed[2].toFixed(11)) &&
						Number(szOv[3].toFixed(11)) <= Number(bleed[3].toFixed(11))
					) break;
					if ((obj[i].constructor.name == "Rectangle" ||
						obj[i].constructor.name == "TextFrame") &&
						(obj[i].absoluteRotationAngle == 0 ||
						Math.abs(obj[i].absoluteRotationAngle) == 90 ||
						Math.abs(obj[i].absoluteRotationAngle) == 180)) {
							obj[i].geometricBounds = size;
							break;
					}
					if (obj[i].constructor.name == "GraphicLine" && (szOg[0] == szOg[2]) || (szOg[1] == szOg[3])) {
						var frame = page.rectangles.add({
							label: "<clip group>", name: "<clip group>",
							itemLayer: obj[i].itemLayer,
							fillColor: "None", strokeColor: "None",
							geometricBounds: size
						});
						var frame_TL = frame.resolve(AnchorPoint.TOP_LEFT_ANCHOR, 
							CoordinateSpaces.SPREAD_COORDINATES)[0];
						var frame_BR = frame.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, 
							CoordinateSpaces.SPREAD_COORDINATES)[0];
						frame.remove();
						if ( // Skip if obj[i] size is smaller than target size
							Number(bleed[0].toFixed(11)) <= Number(frame_TL[1].toFixed(11)) &&
							Number(bleed[1].toFixed(11)) <= Number(frame_TL[0].toFixed(11)) &&
							Number(bleed[2].toFixed(11)) >= Number(frame_BR[3].toFixed(11)) &&
							Number(bleed[3].toFixed(11)) >= Number(frame_BR[2].toFixed(11))
						) break;
						if (obj[i].endCap == 1650680176 && // EndCap.BUTT_END_CAP
							obj[i].strokeWeight >= 0.5 ) {
							obj[i].reframe(CoordinateSpaces.SPREAD_COORDINATES, [frame_TL, frame_BR]);
							break;
						}
					}
					// Other cases: Containment
					var frame = page.rectangles.add({
						label: "<clip group>", name: "<clip group>",
						itemLayer: obj[i].itemLayer,
						fillColor: "None", strokeColor: "None",
						geometricBounds: size
					});
					frame.sendToBack(obj[i]);
					app.select(obj[i]); app.cut();
					app.select(frame); app.pasteInto();
					break;
			}
		}
	}
}

function Unique(array) { // Return array w/o duplicates
	var m = {}, u = [];
	for (var i = 1; i < array.length; i++) {
		var v = array[i];
		if (!m[v] && v != "") { u.push(v); m[v] = true };
	}
	return u;
}

function FindLayer(names) { // Find first layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]);
		if (layer.isValid) return names[i];
	}
	return names[0]; // If nothing found, return first name
}

function SortPagesByRatio() { // Sort master pages by ratio; return ratio array
	var r = [];
	for (var i = 0; i < doc.pages.length; i++) {
		r.push(Number(
			(doc.pages[i].bounds[3] - doc.pages[i].bounds[1]) /
			(doc.pages[i].bounds[2] - doc.pages[i].bounds[0])
		));
	}
	for (var i = 0; i < (r.length - 1); i++) {
		if (r[i] > r[(i + 1)]) {
			doc.spreads.item(i).move(LocationOptions.AFTER, doc.spreads.item(i + 1));
			SortPagesByRatio();
		}
	}
	return r;
}

function ProgressBar() {
	var w = new Window("palette", "Batch Resize: " + masterFile.name);
	var pb = w.add("progressbar", [12, 12, 800, 24], 0, undefined);
	var st = w.add("statictext", [0, 0, 780, 20], undefined, { truncate: "middle" });
	this.reset = function(max) {
		pb.value = 0;
		pb.maxvalue = max || 0;
		pb.visible = !!max;
		w.show();
	}
	this.update = function(val) {
		pb.value = val;
		st.text = "Processing file " + infoFN[val] + " (" + val + " of " + pb.maxvalue + ")";
		w.show(); w.update();
	}
	this.hide = function() { w.hide() };
	this.close = function() { w.close() };
}

function GetPage() { // Compare ratios and select closest; return target page
	var t;
	var targetRatio = Number(infoS[line].width / infoS[line].height);
	for (var i = 0; i < ratios.length; i++) {
		var avgR = Number(((ratios[i + 1] - ratios[i]) / 2) + ratios[i]);
		if (targetRatio > ratios[i]) {
			if (i == ratios.length - 1) { t = i; break }
			else if (targetRatio <= ratios[i + 1]) {
				if (targetRatio <= avgR) { t = i; break }
				else if (targetRatio > avgR) { t = i + 1; break };
			}
		} else if (targetRatio <= ratios[0]) { t = 0; break };
	}
	return t;
}

function BleedBounds() {
	var page = target.pages[0];
	var bleed = {
		top: target.documentPreferences.properties.documentBleedTopOffset,
		left: target.documentPreferences.properties.documentBleedInsideOrLeftOffset,
		bottom: target.documentPreferences.properties.documentBleedBottomOffset,
		right: target.documentPreferences.properties.documentBleedOutsideOrRightOffset
	}
	if (page.side == PageSideOptions.LEFT_HAND) {
		bleed.left = target.documentPreferences.properties.documentBleedOutsideOrRightOffset;
		bleed.right = target.documentPreferences.properties.documentBleedInsideOrLeftOffset;
	}
	return [
		page.bounds[0] - bleed.top,
		page.bounds[1] - bleed.left,
		page.bounds[2] + bleed.bottom,
		page.bounds[3] + bleed.right
	];
}