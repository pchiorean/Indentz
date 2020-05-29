/*
	Batch resize v7.15j
	A modified version of Redimensionari v7 by Dan Ichimescu, 22 April 2020
	May 2020, Paul Chiorean

	v7.1j – cleanup
	v7.2j – fix progress bar
	v7.3j – change 'vizibil' to 'safe area'; no guides
	v7.4j – 3 decimals aspect ratio
	v7.5j – 'info' layer
	v7.6j – remove 'HW' section
	v7.7j – join page geometry functions
	v7.8j – split 'safe area' to new function
	v7.9j – rewrite alignment function
	v7.10j – alternative layer names
	v7.11j – redefine scaling to 100%
	v7.12j – duplicate master instead of reopen
	v7.13j – some checks on info file
	v7.14j – add execution timer
	v7.15j – parse info file before batch processing
*/

var doc = app.documents[0]; if (!doc.isValid) exit();
var masterPath = doc.filePath;
var masterFN = masterPath + "/" + doc.name.substr(0, doc.name.lastIndexOf("."));
var masterFile = File(masterFN + ".indd");

// Set some flags
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.scriptPreferences.enableRedraw = false;

// Start timer
var timeDiff = {
	setStartTime: function (){ d = new Date(); time = d.getTime() },
	getDiff: function (){ d = new Date(); t = d.getTime() - time; time = d.getTime(); return t }
}
timeDiff.setStartTime();

// Check and parse info file
var infoFile = File(masterFN + ".txt");
if (!infoFile.open("r")) { alert("File not found."); exit() };
var infoID = [], infoSw = [], infoSh = [], infoTw = [], infoTh = [], infoVL = [], infoFN = [];
var info1w, info1h, info2w, info2h;
var infoLine = infoFile.readln().split("\t"); // Skip first line (the header)
var line = 0;
while (!infoFile.eof) {
	infoLine = infoFile.readln().split("\t"); line++;
	// if (!infoLine[1] || !infoLine[2] || !infoLine[3] || !infoLine[4] || !infoLine[5] || !infoLine[6] || !infoLine[7]) { alert ("Bad data in record " + i + "."); exit() };
	infoID[line] = infoLine[0]; // ID
	// Safe area/total area
	info1w = infoLine[1].replace(/\,/g, "."); info1h = infoLine[2].replace(/\,/g, ".");
	info2w = infoLine[3].replace(/\,/g, "."); info2h = infoLine[4].replace(/\,/g, ".");
	infoSw[line] = Math.min(Number(info1w), Number(info2w)) / 0.352777777777778;
	infoSh[line] = Math.min(Number(info1h), Number(info2h)) / 0.352777777777778;
	infoTw[line] = Math.max(Number(info1w), Number(info2w)) / 0.352777777777778;
	infoTh[line] = Math.max(Number(info1h), Number(info2h)) / 0.352777777777778;
	// infoVL[line] = infoLine[6]; // Layout
	infoFN[line] = infoLine[7]; // Filename
};
infoFile.close();
var infoLines = line; if (infoLines <= 1) { alert ("Not enough records found."); exit() };

// Make technical layers
var safeLayer, infoLayer, idLayer, safeSwatch;
var safeLayerName = ["safe area", "visible", "Visible", "vizibil", "Vizibil", "vis. area", "Vis. area"];
var infoLayerName = ["info", "ratio", "raport"];
var idLayerName = ["id", "ID"];
var safeSwatchName = "Safe area";
var safeLayerFrameP = {
	label: "safe area",
	contentType: ContentType.UNASSIGNED,
	fillColor: "None",
	strokeColor: safeSwatchName,
	strokeWeight: "0.5pt",
	strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
	strokeType: "$ID/Canned Dashed 3x2",
	overprintStroke: false
}
doc.activeLayer = doc.layers.item(0);
if (!(safeLayer = findLayer(doc, safeLayerName))) {
	safeLayer = doc.layers.add({ name: safeLayerName[0], layerColor: UIColors.YELLOW });
}
if (!(infoLayer = findLayer(doc, infoLayerName))) {
	infoLayer = doc.layers.add({ name: infoLayerName[0], layerColor: UIColors.CYAN });
}
infoLayer.move(LocationOptions.BEFORE, safeLayer);
if (!(idLayer = findLayer(doc, idLayerName))) {
	idLayer = doc.layers.add({ name: idLayerName[0], layerColor: UIColors.CYAN });
}
idLayer.move(LocationOptions.BEFORE, infoLayer);
safeSwatch = doc.swatches.itemByName(safeSwatchName);
if (!safeSwatch.isValid) {
	doc.colors.add({ name: safeSwatchName, model: ColorModel.PROCESS, 
	space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] });
};

// Sort master pages by ratio; get ratio array
var ratios = sortPagesByRatio();
if(doc.modified == true) doc.save(masterFile);

// Start batch processing
var progressBar = createProgressBar(infoLines); // Create progress bar
for (line = 1; line <= infoLines; line++) {
	// Duplicate master and process target
	var targetPage = getTargetPage(line);
	var targetFolderName = String(ratios[targetPage]).replace(/\./g, "_");
	var targetFolder = Folder(masterPath + "/" + ("ratio_" + (targetFolderName)));
	targetFolder.create();
	var targetFN = File(targetFolder + "/" + infoFN[line] + ".indd");
	doc.saveACopy(targetFN);
	var target = app.open(targetFN, false);
	updateProgressBar(line);
	// Delete unneeded pages
	for (var i = target.pages.length - 1; i >= 0; i--) {
		if ((i > targetPage) || (i < targetPage)) target.pages[i].remove();
	}
	// Process page
	safeLayer = findLayer(target, safeLayerName);
	infoLayer = findLayer(target, infoLayerName);
	idLayer = findLayer(target, idLayerName);
	safeLayer.properties = infoLayer.properties = idLayer.properties = { locked: false };
	targetSetGeometry();
	targetSetLayout();
	targetAlignElements();
	targetSafeArea();
	targetInfoBox();
	infoLayer.properties = { visible: false, locked: true };
	safeLayer.properties = { visible: true, locked: true };
	idLayer.properties = { visible: true, locked: true };
	// Save and close
	target.save(targetFN).close();
}
progressBar.close();
infoFile.close();
doc.close();
alert("Elapsed time: " + (timeDiff.getDiff() / 1000).toFixed(1) + " seconds.");


function targetSetGeometry() { // Resize visual and set page dimensions
	target.pages[0].marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
	// Scale visual to safe area
	target.pages[0].layoutRule = LayoutRuleOptions.SCALE;
	target.pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
		AnchorPoint.CENTER_ANCHOR,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
		[infoSw[line], infoSh[line]]);
	// Extend page to total area
	target.pages[0].layoutRule = LayoutRuleOptions.OFF;
	target.pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
		AnchorPoint.CENTER_ANCHOR,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
		[infoTw[line], infoTh[line]]);
	// Redefine scaling to 100%
	var item, items = target.allPageItems;
	while (item = items.shift()) item.redefineScaling();
}

function targetSetLayout() { // Set layout
	for (i = 0; i < target.layers.length; i++) {
		var l = target.layers.item(i);
		// if (l.name == infoLine[6]) { l.visible = true } else { l.visible = false };
	}
}

function targetAlignElements() { // Align elements based on their labels
	var obj = target.rectangles;
	var bleed = bleedBounds(target.pages[0]);
	for (var i = 0; i < obj.length; i++) {
		var oLabel = obj[i].label;
		if (oLabel == "alignL" || oLabel == "alignTL" || oLabel == "alignBL") {
			target.align(obj[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		}
		if (oLabel == "alignR" || oLabel == "alignTR" || oLabel == "alignBR") {
			target.align(obj[i], AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		}
		if (oLabel == "alignT" || oLabel == "alignTL" || oLabel == "alignTR") {
			target.align(obj[i], AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		}
		if (oLabel == "alignB" || oLabel == "alignBL" || oLabel == "alignBR") {
			target.align(obj[i], AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		}
		if (oLabel == "alignCh") {
			target.align(obj[i], AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
		}
		if (oLabel == "alignCv") {
			target.align(obj[i], AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
		}
		if (oLabel == "alignC") {
			target.align(obj[i], AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
			target.align(obj[i], AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
		}
		if (oLabel == "bleed") obj[i].geometricBounds = bleed;
		if (oLabel == "expand") {
			obj[i].fit(FitOptions.FRAME_TO_CONTENT);
			obj[i].geometricBounds = [
				Math.max(obj[i].visibleBounds[0], bleed[0]),
				Math.max(obj[i].visibleBounds[1], bleed[1]),
				Math.min(obj[i].visibleBounds[2], bleed[2]),
				Math.min(obj[i].visibleBounds[3], bleed[3])
			];
		}
	}
}

function targetSafeArea() { // Draw a 'safe area' frame
	var mgPg, mgBounds, safeLayerFrame;
	mgPg = { top: (infoTh[line] - infoSh[line]) / 2, left: (infoTw[line] - infoSw[line]) / 2,
		bottom: (infoTh[line] - infoSh[line]) / 2, right: (infoTw[line] - infoSw[line]) / 2 };
	if (mgPg.top + mgPg.left + mgPg.bottom + mgPg.right == 0) return;
	mgBounds = [mgPg.top, mgPg.left, infoSh[line] + mgPg.top, infoSw[line] + mgPg.left];
	target.pages[0].marginPreferences.properties = mgPg;
	safeLayerFrame = target.pages[0].rectangles.add(safeLayerFrameP);
	safeLayerFrame.properties = { itemLayer: safeLayer.name, geometricBounds: mgBounds };
}

function targetInfoBox() { // Draw info boxes
	var infoFrame, infoText;
	// ID box
	infoFrame = target.pages[0].textFrames.add();
	infoFrame.itemLayer = idLayer.name;
	infoFrame.label = "ID";
	if (infoID[line] == "") { infoFrame.contents = " " } else { infoFrame.contents = "ID " + infoID[line] };
	infoText = infoFrame.parentStory.paragraphs.everyItem();
	try { infoText.appliedFont = app.fonts.item("Helvetica Neue") } catch (_) {}
	try { infoText.fontStyle = "Light"; infoText.pointSize = 5 } catch (_) {};
	infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
	infoFrame.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.BOTTOM_ALIGN,
		autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		useNoLineBreaksForAutoSizing: true
	}
	infoFrame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
	infoFrame.move([((infoTw[line] - infoSw[line]) / 2) + 5.67, ((infoTh[line] - infoSh[line]) / 2) + infoSh[line] - 9.239]);
	// Dimensions box
	infoFrame = target.pages[0].textFrames.add();
	infoFrame.itemLayer = infoLayer.name;
	infoFrame.label = "info";
	infoFrame.contents =
		"Total W = " + (infoTw[line] *0.352777777777778) +
		"\rTotal H = " + (infoTh[line] *0.352777777777778) +
		"\r\rSafe area W = " + (infoSw[line] *0.352777777777778) +
		"\rSafe area H = " + (infoSh[line] *0.352777777777778) +
		"\r\rRaport = " + (infoSw[line] / infoSh[line]).toFixed(3);
	infoText = infoFrame.parentStory.paragraphs.everyItem();
	try { infoText.appliedFont = app.fonts.item("Helvetica Neue") } catch (_) {};
	try { infoText.fontStyle = "Light"; infoText.pointSize = 12 } catch (_) {};
	infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
	infoFrame.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.TOP_ALIGN,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.TOP_LEFT_POINT,
		autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
		useNoLineBreaksForAutoSizing: true
	}
	infoFrame.move([infoTw[line] + 20, 0]);
}

function findLayer(doc, names) { // Find first layer from a list of names
	var layer;
	for (var i = 0; i < names.length; i++) {
		layer = doc.layers.item(names[i]); if (layer.isValid) return layer;
	}
}

function sortPagesByRatio() { // Sort master pages by ratio; return ratio array
	var pgW, pgH, r = [];
	for (var i = 0; i < doc.pages.length; i++) {
		pgW = doc.pages[i].bounds[3] - doc.pages[i].bounds[1];
		pgH = doc.pages[i].bounds[2] - doc.pages[i].bounds[0];
		r.push((pgW / pgH).toFixed(3));
	}
	for (var i = 0; i < (r.length - 1); i++) {
		if (r[i] > r[(i + 1)]) {
			doc.spreads.item(i).move(LocationOptions.AFTER, doc.spreads.item(i + 1));
			sortPagesByRatio();
		}
	}
	return r;
}

function createProgressBar(max) {
	var w = new Window("window", masterFN);
	w.pb = w.add("progressbar", [12, 12, 800, 24], 0, undefined);
	w.pb.maxvalue = max;
	w.st = w.add("statictext"); w.st.bounds = [0, 0, 780, 20]; w.st.alignment = "left";
	return w;
}

function updateProgressBar(val) {
	progressBar.pb.value = val;
	progressBar.st.text = "Processing file " + infoFN[val] + " (" + val + " / " + progressBar.pb.maxvalue + ")";
	progressBar.show(); progressBar.update();
}

function getTargetPage(line) { // Compare ratios and select closest; return target page
	var t;
	var targetRatio = (infoSw[line] / infoSh[line]).toFixed(3);
	for (var i = 0; i < ratios.length; i++) {
		var avgR = ((ratios[i + 1] - ratios[i]) / 2) + parseFloat(ratios[i]);
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

function bleedBounds(page) { // Return page bleed bounds
	var doc = page.parent.parent;
	var bleed = {
		top: doc.documentPreferences.properties.documentBleedTopOffset,
		left: doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
		bottom: doc.documentPreferences.properties.documentBleedBottomOffset,
		right: doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
	}
	if (page.side == PageSideOptions.LEFT_HAND) {
		bleed.left = doc.documentPreferences.properties.documentBleedOutsideOrRightOffset;
		bleed.right = doc.documentPreferences.properties.documentBleedInsideOrLeftOffset;
	}
	var m_x1 = page.bounds[1] - bleed.left;
	var m_y1 = page.bounds[0] - bleed.top;
	var m_x2 = page.bounds[3] + bleed.right;
	var m_y2 = page.bounds[2] + bleed.bottom;
	return [m_y1, m_x1, m_y2, m_x2];
}