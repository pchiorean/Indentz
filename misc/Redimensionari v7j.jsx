/*
	Redimensionari v7.8j
	A modified version of Redimensionari v7 by Dan Ichimescu, 22 April 2020
	May 2020, Paul Chiorean

	v7.1j – cleanup
	v7.2j – fix progress bar
	v7.3j – change 'vizibil' to 'safe area'; no guides
	v7.4j – 3 decimals for aspect ratio
	v7.5j – update 'ratio' layer
	v7.6j – remove 'HW' layer dependence
	v7.7j – join page geometry functions
	v7.8j – split 'safe area' to new function
*/

var doc = app.documents[0];
if (!doc.isValid) exit();

// Set defaults
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
app.scriptPreferences.enableRedraw = false;

// Make technical layers
try { doc.layers.add({ name: "safe area", layerColor: UIColors.RED }).move(LocationOptions.AT_BEGINNING) } catch (e) {};
try { doc.layers.add({ name: "ratio", layerColor: UIColors.CYAN }).move(LocationOptions.AT_BEGINNING) } catch (e) {};
try { doc.layers.add({ name: "id", layerColor: UIColors.CYAN }).move(LocationOptions.AT_BEGINNING) } catch (e) {};

// Sort master pages by ratios
var ratio = [];
sort_master_pages();
doc.save();

function sort_master_pages() {
	for (var i = 0; i < doc.pages.length; i++) {
		var pgW = doc.pages[i].bounds[3] - doc.pages[i].bounds[1];
		var pgH = doc.pages[i].bounds[2] - doc.pages[i].bounds[0];
		var r = (pgW / pgH).toFixed(3);
		ratio.push(r);
	}
	for (var i = 0; i < (ratio.length - 1); i++) {
		if (ratio[i] > ratio[(i + 1)]) {
			doc.spreads.item(i).move(LocationOptions.AFTER, doc.spreads.item(i + 1));
			sort_master_pages();
		}
	}
}

// Create progress bar
var masterPath = doc.filePath;
var masterName = doc.name.substr(0, doc.name.lastIndexOf("."));
var infoFile = File(masterPath + "/" + masterName + ".txt");
infoFile.open("r");
var lines = 0, infoLine;
while (!infoFile.eof) { infoLine = infoFile.readln().split("\t"); lines++ };
infoFile.close();
var progressBar = pb();
progressBar.show();

function pb() {
	var w = new Window("window");
	w.pb = w.add("progressbar", [12, 12, 800, 24], 0, undefined);
	w.st = w.add("statictext"); w.st.bounds = [0, 0, 780, 20]; w.st.alignment = "left";
	return w;
}

// Parse info file
var infoLine, infoID, infoFN, infoS_W, infoS_H, infoT_W, infoT_H, info1_W, info1_H, info2_W, info2_H,
	avgR, targetRatio, targetPage, targetFolderName, targetFolder;
infoFile.open("r");
infoLine = infoFile.readln().split("\t"); // Skip first line (the header)
var line = 1;
while (!infoFile.eof) {
	infoLine = infoFile.readln().split("\t");
	infoID = infoLine[0];
	infoFN = infoLine[7];
	// Update progress bar
	progressBar.pb.value = line; progressBar.pb.maxvalue = lines - 1;
	progressBar.st.text = "Processing file " + infoFN + " (" + line + " / " + (lines - 1) + ")";
	progressBar.update();
	line++;
	// Select visible/total
	info1_W = infoLine[1].replace(/\,/g, "."); info1_H = infoLine[2].replace(/\,/g, ".");
	info2_W = infoLine[3].replace(/\,/g, "."); info2_H = infoLine[4].replace(/\,/g, ".");
	infoS_W = Math.min(Number(info1_W), Number(info2_W)) / 0.352777777777778;
	infoS_H = Math.min(Number(info1_H), Number(info2_H)) / 0.352777777777778;
	infoT_W = Math.max(Number(info1_W), Number(info2_W)) / 0.352777777777778;
	infoT_H = Math.max(Number(info1_H), Number(info2_H)) / 0.352777777777778;
	// Compare ratios and select closest
	targetRatio = (infoS_W / infoS_H).toFixed(3);
	for (var i = 0; i < ratio.length; i++) {
		avgR = ((ratio[i + 1] - ratio[i]) / 2) + parseFloat(ratio[i]);
		if (targetRatio > ratio[i]) {
			if (i == ratio.length - 1) { targetPage = i; break }
			else if (targetRatio <= ratio[i + 1]) {
				if (targetRatio <= avgR) { targetPage = i; break }
				else if (targetRatio > avgR) { targetPage = i + 1; break };
			}
		} else if (targetRatio <= ratio[0]) { targetPage = 0; break };
	}
	// Remove all other pages
	for (var i = doc.pages.length - 1; i >= 0; i--) {
		if ((i > targetPage) || (i < targetPage)) doc.pages[i].remove();
	}
	// Create output folders
	targetFolderName = String(ratio[targetPage]).replace(/\./g, "_");
	targetFolder = new Folder(masterPath + "/" + ("ratio_" + (targetFolderName)));
	targetFolder.create();
	// Process target page
	targetSetGeometry(infoS_W, infoS_H, infoT_W, infoT_H);
	targetSafeArea(infoS_W, infoS_H, infoT_W, infoT_H);
	targetInfoBox(infoS_W, infoS_H, infoT_W, infoT_H, infoID);
	targetAlignElements(infoS_W, infoS_H, infoT_W, infoT_H);
	// Set layer attributes
	doc.layers.itemByName("id").visible = true;
	doc.layers.itemByName("id").locked = true;
	doc.layers.itemByName("safe area").visible = true;
	doc.layers.itemByName("safe area").locked = true;
	doc.layers.itemByName("ratio").visible = false;
	doc.layers.itemByName("ratio").locked = true;
	doc.layers.itemByName("HW").visible = true;
	doc.layers.itemByName("HW").locked = true;
	// Save target page as new file
	doc.save(File(targetFolder + "/" + infoFN + ".indd")).close(SaveOptions.no);
	// Reopen master document
	app.open(File(masterPath + "/" + masterName + ".indd"), false);
}
progressBar.close();
infoFile.close();
doc.close();


function targetSetGeometry(infoS_W, infoS_H, infoT_W, infoT_H) {
	doc.zeroPoint = [0, 0];
	doc.viewPreferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;
	doc.pages[0].marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 };
	doc.pages[0].layoutRule = LayoutRuleOptions.SCALE;
	doc.pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
		AnchorPoint.CENTER_ANCHOR,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
		[infoS_W, infoS_H]);
	doc.pages[0].layoutRule = LayoutRuleOptions.OFF;
	doc.pages[0].resize(CoordinateSpaces.SPREAD_COORDINATES,
		AnchorPoint.CENTER_ANCHOR,
		ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
		[infoT_W, infoT_H]);
}

function targetSafeArea(infoS_W, infoS_H, infoT_W, infoT_H) {
	var safeSwatchName = "Safe area";
	var m_top = (infoT_H - infoS_H) / 2;
	var m_left = (infoT_W - infoS_W) / 2;
	var m_right = m_left;
	var m_bottom = m_top;
	doc.pages[0].marginPreferences.properties = { top: m_top, left: m_left, right: m_right, bottom: m_bottom };
	doc.activeLayer = doc.layers.itemByName("safe area");
	try { doc.colors.add({ name: safeSwatchName, model: ColorModel.PROCESS,
		space: ColorSpace.CMYK, colorValue: [0, 100, 0, 0] })
	} catch (_) {};
	doc.pages[0].rectangles.add({
		geometricBounds: [m_top, m_left, m_top + infoS_H, m_left + infoS_W],
		label: "safe area",
		contentType: ContentType.UNASSIGNED,
		fillColor: "None",
		strokeColor: safeSwatchName,
		strokeWeight: "0.5pt",
		strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT,
		strokeType: "$ID/Canned Dashed 3x2",
		overprintStroke: false
	});
}

function targetInfoBox(infoS_W, infoS_H, infoT_W, infoT_H, infoID) {
	var infoFrame, infoText;
	// ID frame
	doc.activeLayer = doc.layers.itemByName("id");
	infoFrame = doc.pages[0].textFrames.add();
	infoFrame.label = "ID";
	if (infoID == "") { infoFrame.contents = " " } else { infoFrame.contents = "ID " + infoID };
	infoText = infoFrame.parentStory.paragraphs.everyItem();
	try { infoText.appliedFont = app.fonts.item("Helvetica Neue") } catch (e) {}
	try { infoText.fontStyle = "Light"; infoText.pointSize = 5 } catch (e) {};
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
	doc.activeLayer = doc.layers.itemByName("ratio");
	infoFrame = doc.pages[0].textFrames.add();
	infoFrame.label = "ratio";
	infoFrame.contents = 
		"Total W = " + (infoT_W *0.352777777777778) +
		"\rTotal H = " + (infoT_H *0.352777777777778) +
		"\r\rSafeArea W = " + (infoS_W *0.352777777777778) +
		"\rSafeArea H = " + (infoS_H *0.352777777777778) +
		"\r\rRaport = " + targetRatio;
	infoText = infoFrame.parentStory.paragraphs.everyItem();
	try { infoText.appliedFont = app.fonts.item("Helvetica Neue") } catch (e) {};
	try { infoText.fontStyle = "Regular"; infoText.pointSize = 12 } catch (e) {};
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

function targetAlignElements(infoS_W, infoS_H, infoT_W, infoT_H) {
	var myFrames = doc.rectangles;
	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignRightToSafeArea") {
			doc.align(myFrames[i], AlignOptions.RIGHT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		}
	}

for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignLeftToSafeArea") {
			doc.align(myFrames[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		}
	}

	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignUpToSafeArea") {
			doc.align(myFrames[i], AlignOptions.TOP_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		}
	}

	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignDownToSafeArea") {
			doc.align(myFrames[i], AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		}
	}

	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignRightLaPagina") {
			doc.align(myFrames[i], AlignOptions.RIGHT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
		}
	}

	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignLeftLaPagina") {
			doc.align(myFrames[i], AlignOptions.LEFT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
		}
	}

	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignHorizontalCenter") {
			doc.align(myFrames[i], AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
		}
	}

	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "alignVerticalCentersMinusHW") {
			doc.align(myFrames[i], AlignOptions.VERTICAL_CENTERS, AlignDistributeBounds.MARGIN_BOUNDS);
			var pgW = doc.pages[0].bounds[3] - doc.pages[0].bounds[1];
			var pgH = doc.pages[0].bounds[2] - doc.pages[0].bounds[0];

			var myBoundsFrame = myFrames[i].geometricBounds; // HW dreptunghi alb
			var myYF = myBoundsFrame[0];
			var myXF = myBoundsFrame[1];
			var myHF = myBoundsFrame[2];
			var myWF = myBoundsFrame[3];
			var W_hF = myWF - myXF;
			var H_hF = myHF - myYF;
			var moveFrame = (pgH - (pgH * 0.1)) / 2 - (H_hF / 2);
			myFrames[i].move([myXF, moveFrame]);
		}
	}

	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "expandToSafeArea") {
			var m_top = doc.pages[0].marginPreferences.properties.top;
			var m_left = doc.pages[0].marginPreferences.properties.left;
			var m_right = doc.pages[0].marginPreferences.properties.right;
			var m_bottom = doc.pages[0].marginPreferences.properties.bottom;

			var pgW = doc.pages[0].bounds[3] - doc.pages[0].bounds[1];
			var pgH = doc.pages[0].bounds[2] - doc.pages[0].bounds[0];
			myFrames[i].geometricBounds = [m_top, m_left, pgH - m_bottom, pgW - m_right];
		}
	}

	for (var i = 0; i < myFrames.length; i++) {
		if (myFrames[i].label == "expandToBleed") {
			var pgW = doc.pages[0].bounds[3] - doc.pages[0].bounds[1];
			var pgH = doc.pages[0].bounds[2] - doc.pages[0].bounds[0];
			myFrames[i].geometricBounds = [-14.174, -14.174, pgH + 14.174, pgW + 14.174];
		}
	}
}