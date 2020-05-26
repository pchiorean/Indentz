/*
	Batch resize v7.12j
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
	v7.12j – duplicate master instead of open/reopen
*/

var doc = app.documents[0]; if (!doc.isValid) exit();
var masterPath = doc.filePath;
var masterName = doc.name.substr(0, doc.name.lastIndexOf("."));
var masterFile = File(masterPath + "/" + masterName + ".indd");

// Set defaults
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.scriptPreferences.enableRedraw = false;

// Make technical layers
var safeLayer, infoLayer, idLayer;
var safeLayerName = ["safe area", "visible", "Visible", "vizibil", "Vizibil", "vis. area", "Vis. area"];
var infoLayerName = ["info", "ratio", "raport"];
var idLayerName = ["id", "ID"];
const safeSwatchName = "Safe area";
const safeLayerFrameP = {
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
if (!(safeLayer = findLayer(doc, safeLayerName))) safeLayer = doc.layers.add({ name: safeLayerName[0], layerColor: UIColors.YELLOW });
if (!(infoLayer = findLayer(doc, infoLayerName))) infoLayer = doc.layers.add({ name: infoLayerName[0], layerColor: UIColors.CYAN });
if (!(idLayer = findLayer(doc, idLayerName))) idLayer = doc.layers.add({ name: idLayerName[0], layerColor: UIColors.CYAN });
infoLayer.move(LocationOptions.before, safeLayer); idLayer.move(LocationOptions.before, infoLayer);
safeLayer.properties = infoLayer.properties = idLayer.properties = { visible: true, locked: false };
try { doc.colors.add({ name: safeSwatchName, model: ColorModel.PROCESS, space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] }) } catch (_) {};

// Sort master pages by ratios
var ratio = [];
sortPagesByRatio(doc);
doc.save(masterFile);

// Start batch processing
var infoFile = File(masterPath + "/" + masterName + ".txt");
var progressBar = createProgressBar(countLines(infoFile) - 1); // Create progress bar
infoFile.open("r");
var infoLine = infoFile.readln().split("\t"); // Skip first line (the header)
var line = 1;
while (!infoFile.eof) {
	infoLine = infoFile.readln().split("\t");
	var infoID = infoLine[0];
	var infoFN = infoLine[7];
	var info1_W, info1_H, info2_W, info2_H, infoS_W, infoS_H, infoT_W, infoT_H;
	// Read and select visible/total
	info1_W = infoLine[1].replace(/\,/g, "."); info1_H = infoLine[2].replace(/\,/g, ".");
	info2_W = infoLine[3].replace(/\,/g, "."); info2_H = infoLine[4].replace(/\,/g, ".");
	infoS_W = Math.min(Number(info1_W), Number(info2_W)) / 0.352777777777778;
	infoS_H = Math.min(Number(info1_H), Number(info2_H)) / 0.352777777777778;
	infoT_W = Math.max(Number(info1_W), Number(info2_W)) / 0.352777777777778;
	infoT_H = Math.max(Number(info1_H), Number(info2_H)) / 0.352777777777778;
	// Compare ratios and select closest
	var targetPage;
	var targetRatio = (infoS_W / infoS_H).toFixed(3);
	for (var i = 0; i < ratio.length; i++) {
		var avgR = ((ratio[i + 1] - ratio[i]) / 2) + parseFloat(ratio[i]);
		if (targetRatio > ratio[i]) {
			if (i == ratio.length - 1) { targetPage = i; break }
			else if (targetRatio <= ratio[i + 1]) {
				if (targetRatio <= avgR) { targetPage = i; break }
				else if (targetRatio > avgR) { targetPage = i + 1; break };
			}
		} else if (targetRatio <= ratio[0]) { targetPage = 0; break };
	}
	// Duplicate master and process target
	var targetFolderName = String(ratio[targetPage]).replace(/\./g, "_");
	var targetFolder = Folder(masterPath + "/" + ("ratio_" + (targetFolderName)));
	targetFolder.create();
	var targetFN = File(targetFolder + "/" + infoFN + ".indd");
	doc.saveACopy(targetFN);
	var target = app.open(targetFN, false);
	updateProgressBar(line);
	processTarget(target);
	// Loop
	line++;
}
progressBar.close();
infoFile.close();
doc.close();


function processTarget(target) {
	safeLayer = findLayer(target, safeLayerName);
	infoLayer = findLayer(target, infoLayerName);
	idLayer = findLayer(target, idLayerName);
	// Remove unneeded pages
	for (var i = target.pages.length - 1; i >= 0; i--) {
		if ((i > targetPage) || (i < targetPage)) target.pages[i].remove();
	}
	// Process target page
	targetSetGeometry(target);
	targetAlignElements(target);
	targetSafeArea(target);
	targetInfoBox(target);
	// Set layer attributes
	infoLayer.properties = { visible: false, locked: true };
	safeLayer.properties = { visible: true, locked: true };
	// if (safeLayer.isValid) safeLayer.properties = { visible: true, locked: true };
	idLayer.properties = { visible: true, locked: true };
	// Save and close
	target.save(targetFN).close();
}

function targetSetGeometry(target) {
	target.pages[0].marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
	target.pages[0].layoutRule = LayoutRuleOptions.SCALE;
	target.pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
		AnchorPoint.CENTER_ANCHOR,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
		[infoS_W, infoS_H]);
	target.pages[0].layoutRule = LayoutRuleOptions.OFF;
	target.pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
		AnchorPoint.CENTER_ANCHOR,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
		[infoT_W, infoT_H]);
	// Redefine scaling to 100%
	var item, items = target.allPageItems;
	while (item = items.shift()) item.redefineScaling();
}

function targetAlignElements(target) {
	var obj = target.rectangles;
	var bleed = bleedBounds(target.pages[0]);
	for (var i = 0; i < obj.length; i++) {
		var oLabel = obj[i].label;
		if (oLabel == "alignL" || oLabel == "alignTL" || oLabel == "alignBL") target.align(obj[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		if (oLabel == "alignR" || oLabel == "alignTR" || oLabel == "alignBR") target.align(obj[i], AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		if (oLabel == "alignT" || oLabel == "alignTL" || oLabel == "alignTR") target.align(obj[i], AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		if (oLabel == "alignB" || oLabel == "alignBL" || oLabel == "alignBR") target.align(obj[i], AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		if (oLabel == "alignCh") target.align(obj[i], AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
		if (oLabel == "alignCv") target.align(obj[i], AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
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

function targetSafeArea(target) {
	var mgPg, mgBounds, safeLayerFrame;
	mgPg = { top: (infoT_H - infoS_H) / 2, left: (infoT_W - infoS_W) / 2,
		bottom: (infoT_H - infoS_H) / 2, right: (infoT_W - infoS_W) / 2 };
	if (mgPg.top + mgPg.left + mgPg.bottom + mgPg.right == 0) return;
	mgBounds = [mgPg.top, mgPg.left, infoS_H + mgPg.top, infoS_W + mgPg.left];
	target.pages[0].marginPreferences.properties = mgPg;
	safeLayerFrame = target.pages[0].rectangles.add(safeLayerFrameP);
	safeLayerFrame.properties = { itemLayer: safeLayer.name, geometricBounds: mgBounds };
}

function targetInfoBox(target) {
	var infoFrame, infoText;
	// ID frame
	infoFrame = target.pages[0].textFrames.add();
	infoFrame.itemLayer = idLayer.name;
	infoFrame.label = "ID";
	if (infoID == "") { infoFrame.contents = " " } else { infoFrame.contents = "ID " + infoID };
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
	infoFrame.move([((infoT_W - infoS_W) / 2) + 5.67, ((infoT_H - infoS_H) / 2) + infoS_H - 9.239]);
	// Dimensions frame
	infoFrame = target.pages[0].textFrames.add();
	infoFrame.itemLayer = infoLayer.name;
	infoFrame.label = "info";
	infoFrame.contents =
		"Total W = " + (infoT_W *0.352777777777778) +
		"\rTotal H = " + (infoT_H *0.352777777777778) +
		"\r\rSafe area W = " + (infoS_W *0.352777777777778) +
		"\rSafe area H = " + (infoS_H *0.352777777777778) +
		"\r\rRaport = " + (infoS_W / infoS_H).toFixed(3);
	infoText = infoFrame.parentStory.paragraphs.everyItem();
	try { infoText.appliedFont = app.fonts.item("Helvetica Neue") } catch (_) {};
	try { infoText.fontStyle = "Regular"; infoText.pointSize = 12 } catch (_) {};
	infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
	infoFrame.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.TOP_ALIGN,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.TOP_LEFT_POINT,
		autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
		useNoLineBreaksForAutoSizing: true
	}
	infoFrame.move([infoT_W + 20, 0]);
}

function findLayer(doc, names) {
	var layer;
	for (var i = 0; i < names.length; i++) {
		layer = doc.layers.item(names[i]); if (layer.isValid) return layer;
	}
}

function sortPagesByRatio(doc) {
	var pgW, pgH, r;
	for (var i = 0; i < doc.pages.length; i++) {
		pgW = doc.pages[i].bounds[3] - doc.pages[i].bounds[1];
		pgH = doc.pages[i].bounds[2] - doc.pages[i].bounds[0];
		r = (pgW / pgH).toFixed(3);
		ratio.push(r);
	}
	for (var i = 0; i < (ratio.length - 1); i++) {
		if (ratio[i] > ratio[(i + 1)]) {
			doc.spreads.item(i).move(LocationOptions.AFTER, doc.spreads.item(i + 1));
			sortPagesByRatio();
		}
	}
}

function countLines(file) {
	var i = 0;
	file.open("r");
	while (!file.eof) { file.readln().split("\t"); i++ };
	file.close();
	return i;
}

function createProgressBar(max) {
	var w = new Window("window", masterPath + "/" + masterName);
	w.pb = w.add("progressbar", [12, 12, 800, 24], 0, undefined);
	w.pb.maxvalue = max;
	w.st = w.add("statictext"); w.st.bounds = [0, 0, 780, 20]; w.st.alignment = "left";
	return w;
}

function updateProgressBar(val) {
	progressBar.pb.value = val;
	progressBar.st.text = "Processing file " + infoFN + " (" + val + " / " + progressBar.pb.maxvalue + ")";
	progressBar.show()
	progressBar.update();
}

function bleedBounds(page) {
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