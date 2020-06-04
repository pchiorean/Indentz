/*
	Batch resize v7.18j
	A modified version of Redimensionari v7 by Dan Ichimescu, 22 April 2020
	June 2020, Paul Chiorean

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
	v7.16j – activate layout layers based on col. 7
	v7.17j – join progress bar functions
	v7.18j – if possible, put ID outside safe area
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

// Step 0. Initialisation
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

// Step 1. Check and parse info file
var infoFile = File(masterFN + ".txt");
if (!infoFile.open("r")) { alert("File not found."); exit() };
var infoID = [], infoSw = [], infoSh = [], infoTw = [], infoTh = [], infoVL = [], infoFN = [];
var info1w, info1h, info2w, info2h;
var infoLine = infoFile.readln().split("\t"); // Skip first line (the header)
var line = 0;
while (!infoFile.eof) {
	infoLine = infoFile.readln().split("\t"); line++;
	if (!infoLine[1] || !infoLine[2] || !infoLine[3] || !infoLine[4] || !infoLine[5] || !infoLine[7]) { alert ("Bad data in record " + line + "."); exit() };
	infoID[line] = infoLine[0]; // ID
	// Safe area/total area
	info1w = infoLine[1].replace(/\,/g, "."); info1h = infoLine[2].replace(/\,/g, ".");
	info2w = infoLine[3].replace(/\,/g, "."); info2h = infoLine[4].replace(/\,/g, ".");
	infoSw[line] = Math.min(Number(info1w), Number(info2w)) / 0.352777777777778;
	infoSh[line] = Math.min(Number(info1h), Number(info2h)) / 0.352777777777778;
	infoTw[line] = Math.max(Number(info1w), Number(info2w)) / 0.352777777777778;
	infoTh[line] = Math.max(Number(info1h), Number(info2h)) / 0.352777777777778;
	infoVL[line] = infoLine[6]; // Layout
	infoFN[line] = infoLine[7]; // Filename
};
infoFile.close();
var infoLines = line; if (infoLines <= 1) { alert ("Not enough records found."); exit() };
var layouts = unique(infoVL); // Get unique layouts array

// Step 2. Master file
// Make technical layers
var safeLayerName = findLayer(["safe area", "visible", "Visible", "vizibil", "Vizibil", "vis. area", "Vis. area"]);
var infoLayerName = findLayer(["info", "ratio"]);
var idLayerName = "id";
var safeSwatchName = "Safe area";
var safeLayerFrameP = {
	label: "safe area",
	contentType: ContentType.UNASSIGNED,
	fillColor: "None",
	strokeColor: safeSwatchName,
	strokeWeight: "0.75pt",
	strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
	strokeType: "$ID/Canned Dashed 3x2",
	overprintStroke: false
}
doc.activeLayer = doc.layers.item(0);
var safeLayer = doc.layers.item(safeLayerName);
var infoLayer = doc.layers.item(infoLayerName);
var idLayer = doc.layers.item(idLayerName);
if (!safeLayer.isValid) doc.layers.add({ name: safeLayerName, layerColor: UIColors.YELLOW });
if (!infoLayer.isValid) doc.layers.add({ name: infoLayerName, layerColor: UIColors.CYAN });
infoLayer.move(LocationOptions.BEFORE, safeLayer);
if (!idLayer.isValid) doc.layers.add({ name: idLayerName, layerColor: UIColors.CYAN });
idLayer.move(LocationOptions.BEFORE, infoLayer);
var safeSwatch = doc.swatches.itemByName(safeSwatchName);
if (!safeSwatch.isValid) {
	doc.colors.add({ name: safeSwatchName, model: ColorModel.PROCESS, 
	space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] });
};
// Sort master pages by ratio; get ratio array
var ratios = sortPagesByRatio();
if(doc.modified == true) doc.save(masterFile); 
doc.close();
var doc = app.open(masterFile, false);

// Step 3. Batch processing
var progressBar = new ProgressBar(); // Init progress bar
progressBar.reset(infoLines);
for (line = 1; line <= infoLines; line++) {
	// Select target page
	var targetPage = getTargetPage(line);
	// Create folder and save a copy
	var targetFolder = Folder(masterPath + "/" + ("_ratia_" + (String(ratios[targetPage]).replace(/\./g, "_"))));
	targetFolder.create();
	var targetFile = File(targetFolder + "/" + infoFN[line] + ".indd");
	doc.saveACopy(targetFile);
	// Open saved copy
	var target = app.open(targetFile, false);
	progressBar.update(line); // Update progress bar
	// Delete unneeded pages
	for (var i = target.pages.length - 1; i >= 0; i--) {
		if ((i > targetPage) || (i < targetPage)) target.pages[i].remove();
	}
	// Unlock technical layers
	safeLayer = target.layers.item(safeLayerName);
	infoLayer = target.layers.item(infoLayerName);
	idLayer = target.layers.item(idLayerName);
	safeLayer.properties = infoLayer.properties = idLayer.properties = { locked: false };
	// Process page
	targetSetGeometry();
	if (layouts != "") targetSetLayout();
	targetAlignElements();
	targetSafeArea();
	targetIDBox();
	targetInfoBox();
	// Lock technical layers
	infoLayer.properties = { visible: false, locked: true };
	safeLayer.properties = { visible: true, locked: true };
	idLayer.properties = { visible: true, locked: true };
	// Save and close copy
	target.save(targetFile).close();
}
progressBar.close();
infoFile.close();
doc.close(SaveOptions.NO);
alert("Elapsed time: " + (timeDiff.getDiff() / 1000).toFixed(1) + " seconds.");


// Functions
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

function targetSetLayout() { // Set layout variant
	if (infoVL[line] == "") return;
	for (var i = 0; i < layouts.length; i++) try { target.layers.item(layouts[i]).visible = false } catch (_) {};
	try { target.layers.item(infoVL[line]).visible = true } catch (_) {};
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
	safeLayerFrame.properties = { itemLayer: safeLayerName, geometricBounds: mgBounds };
}

function targetIDBox() { // Draw ID box
	var infoFrame, infoText;
	infoFrame = target.pages[0].textFrames.add();
	infoFrame.itemLayer = idLayerName;
	infoFrame.label = "ID";
	if (infoID[line] == "") { infoFrame.contents = " " } else { infoFrame.contents = "ID " + infoID[line] };
	infoText = infoFrame.parentStory.paragraphs.everyItem();
	try { infoText.appliedFont = app.fonts.item("Helvetica Neue") } catch (_) {};
	try { infoText.fontStyle = "Light"; infoText.pointSize = 5 } catch (_) {};
	infoFrame.fit(FitOptions.FRAME_TO_CONTENT);
	infoFrame.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.BOTTOM_ALIGN,
		autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		useNoLineBreaksForAutoSizing: true,
		insetSpacing: [0, 5.669, 5.669, 0]
	}
	infoFrame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
	// Check and, if possible, put ID outside safe area
	var szIf = {
		width: infoFrame.geometricBounds[3] - infoFrame.geometricBounds[1],
		height: infoFrame.geometricBounds[2] - infoFrame.geometricBounds[0]
	}
	var szMg = { width: (infoTw[line] - infoSw[line]) / 2, height: (infoTh[line] - infoSh[line]) / 2 };
	if ((szMg.width > szIf.width) && (szMg.height > szIf.height)) {
		infoFrame.move([ 0, infoTh[line] - szIf.height ]);
	} else {
		infoFrame.move([ szMg.width, szMg.height + infoSh[line] - szIf.height ]);
	}
}

function targetInfoBox() { // Draw info box
	var infoFrame, infoText;
	infoFrame = target.pages[0].textFrames.add();
	infoFrame.itemLayer = infoLayerName;
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

function unique(array) { // Return array w/o duplicates
	var m = {}, u = [];
	for (var i = 1; i < array.length; i++) {
		var v = array[i];
		if (!m[v] && v != "") { u.push(v); m[v] = true };
	}
	return u;
}

function findLayer(names) { // Find first layer from a list of names
	for (var i = 0; i < names.length; i++) {
		var layer = doc.layers.item(names[i]); if (layer.isValid) return names[i];
	}
	return names[0]; // Nothing found, return first name
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

function ProgressBar() {
	var w = new Window("palette", masterFN);
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