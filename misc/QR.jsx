/*
	QR code v3.2 (2021-03-29)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Adds a QR code to the current document or to a separate file.

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

app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.enableRedraw = false;
var doc = app.documents.length == 0 ? app.documents.add() : app.activeDocument;
if (doc.saved) var currentPath = doc.filePath;
var errors = [];

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "QR code");

function main() {
	var isOnFile;
	var ui = new Window("dialog", "Generate QR Code");
	ui.orientation = "row";
	ui.alignChildren = ["left", "fill"];
	ui.qpanel = ui.add("panel", undefined, undefined);
	ui.qpanel.orientation = "column";
	ui.qpanel.alignChildren = ["left", "top"];
	ui.qpanel.add("statictext", undefined, "Enter QR code text:", { name: "st" });
	ui.label = ui.qpanel.add("edittext", undefined, "", { enterKeySignalsOnChange: true });
	ui.label.helpTip = "Use '|' for manual line breaks";
	ui.label.characters = 56;
	ui.label.active = true;
	ui.white = ui.qpanel.add("checkbox", undefined, "White text");
	ui.white.helpTip = "Make text white (ignored when separate)";
	ui.actions = ui.add("group", undefined);
	ui.actions.orientation = "column";
	ui.actions.alignChildren = ["fill", "top"];
	ui.ondoc = ui.actions.add("button", undefined, "On doc", { name: "ok" });
	ui.ondoc.helpTip = "Bottom-left corner of each page";
	ui.onfile = ui.actions.add("button", undefined, "External");
	ui.onfile.helpTip = !!currentPath ?
		"'QR Codes/" + doc.name.substr(0, doc.name.lastIndexOf(".")) + "_QR.indd'" :
		"Where? Document is not saved";
	ui.actions.add("button", undefined, "Cancel", { name: "cancel" });
	ui.onfile.enabled = !!currentPath;
	ui.ondoc.onClick = function() { isOnFile = false; ui.close() }
	ui.onfile.onClick = function() { isOnFile = true; ui.close() }
	if (ui.show() == 2) exit();
	// Processing
	var code = ui.label.text.replace(/^\s+/, '').replace(/\s+$/, '');
	if (!code) { main(); exit() }
	errors = [];
	if (isOnFile) { MakeQROnFile(code) } else { MakeQROnDoc(code, ui.white.value) }
	if (errors.length > 0) AlertScroll("Errors", errors);
}

function MakeQROnDoc(code, /*bool*/isWhite) {
	var idLayer = MakeIDLayer(doc);
	doc.activeLayer = idLayer;
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages.item(i);
		// Remove old codes
		var item, items = page.pageItems.everyItem().getElements();
		while (item = items.shift()) if (item.label == "QR") { item.itemLayer.locked = false; item.remove() }
		// Add label
		var labelFrame = page.textFrames.add({
			label: "QR",
			itemLayer: idLayer.name,
			fillColor: "None",
			strokeColor: "None",
			contents: /\|/g.test(code) ?        // If '|' found
				code.replace(/\|/g, "\u000A") : // replace it with Forced Line Break
				BalanceText(code, 20)           // else auto balance text
		});
		labelFrame.paragraphs.everyItem().properties = {
			appliedFont: app.fonts.item("Helvetica Neue\tRegular"),
			pointSize: "5 pt",
			autoLeading: 100,
			horizontalScale: 92,
			tracking: -15,
			hyphenation: false,
			capitalization: Capitalization.ALL_CAPS,
			fillColor: isWhite ? "Paper" : "Black", // White text checkbox
			strokeColor: "None"
		}
		labelFrame.textFramePreferences.properties = {
			verticalJustification: VerticalJustification.BOTTOM_ALIGN,
			firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
			autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
			autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
			useNoLineBreaksForAutoSizing: true,
			insetSpacing: [
				UnitValue("3 mm").as("pt"), UnitValue("2.5 mm").as("pt"),
				UnitValue("1 mm").as("pt"), 0
			]
		}
		doc.align(labelFrame, AlignOptions.LEFT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
		doc.align(labelFrame, AlignOptions.TOP_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
		// Add code
		var codeFrame = page.rectangles.add({
			itemLayer: idLayer.name,
			label: "QR",
			fillColor: "Paper",
			strokeColor: "None"
		});
		codeFrame.absoluteRotationAngle = -90;
		codeFrame.geometricBounds = [
			labelFrame.geometricBounds[2],
			page.bounds[1] + UnitValue("2.3 mm").as("pt"),
			labelFrame.geometricBounds[2] + UnitValue("11.8 mm").as("pt"),
			page.bounds[1] + UnitValue("14.1 mm").as("pt")
		];
		codeFrame.createPlainTextQRCode(code.replace(/\|/g, "")); // Remove manual LB markers
		codeFrame.frameFittingOptions.properties = {
			fittingAlignment: AnchorPoint.CENTER_ANCHOR,
			fittingOnEmptyFrame: EmptyFrameFittingOptions.PROPORTIONALLY,
			topCrop: UnitValue("2.7 mm").as("pt"),
			leftCrop: UnitValue("2.7 mm").as("pt"),
			bottomCrop: UnitValue("2.7 mm").as("pt"),
			rightCrop: UnitValue("2.7 mm").as("pt")
		}
		// codeFrame.localDisplaySetting = DisplaySettingOptions.HIGH_QUALITY;
		codeFrame.epss[0].localDisplaySetting = ViewDisplaySettings.HIGH_QUALITY;
		// Reposition
		var qrGroup = page.groups.add([labelFrame, codeFrame]);
		qrGroup.absoluteRotationAngle = 90;
		// If possible, put code outside safe area
		var mgs = Margins(page);
		var szLabel = {
			width: labelFrame.geometricBounds[3] - labelFrame.geometricBounds[1],
			height: labelFrame.geometricBounds[2] - labelFrame.geometricBounds[0]
		}
		var szCode = codeFrame.geometricBounds[3] - codeFrame.geometricBounds[1];
		doc.align(qrGroup, AlignOptions.LEFT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
		doc.align(qrGroup, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
		if ((szLabel.width > mgs.left && szLabel.height > mgs.bottom) ||
			((szLabel.width + szCode) > mgs.left && (szCode + UnitValue("2.3 mm").as("pt")) > mgs.bottom)) {
			doc.align(qrGroup, AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
			doc.align(qrGroup, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		}
		qrGroup.ungroup();
	}
}

function MakeQROnFile(code) {
	var target = app.documents.add();
	var page = target.pages[0];
	var idLayer = MakeIDLayer(target);
	// Add label
	var labelFrame = page.textFrames.add({
		label: "QR",
		itemLayer: idLayer.name,
		fillColor: "None",
		strokeColor: "None",
		contents: /\|/g.test(code) ?        // If '|' found
			code.replace(/\|/g, "\u000A") : // replace it with Forced Line Break
			BalanceText(code, 18)           // else auto balance text
	});
	labelFrame.paragraphs.everyItem().properties = {
		appliedFont: app.fonts.item("Helvetica Neue\tRegular"),
		pointSize: "5 pt",
		autoLeading: 100,
		horizontalScale: 92,
		tracking: -15,
		capitalization: Capitalization.ALL_CAPS,
		hyphenation: false,
		fillColor: "Black"
	}
	labelFrame.geometricBounds = [
		0, 0,
		16.4046459005573, UnitValue("20 mm").as("pt")
	];
	labelFrame.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.BOTTOM_ALIGN,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
		autoSizingType: AutoSizingTypeEnum.HEIGHT_ONLY,
		insetSpacing: [
			UnitValue("1 mm").as("pt"), UnitValue("1 mm").as("pt"),
			0, UnitValue("0.5 mm").as("pt")
		]
	}
	// Add code
	var codeFrame = page.rectangles.add({ itemLayer: idLayer.name, label: "QR" });
	codeFrame.absoluteRotationAngle = -90;
	codeFrame.geometricBounds = [
		UnitValue("5.787 mm").as("pt"), 0,
		UnitValue("26 mm").as("pt"), UnitValue("20 mm").as("pt")
	];
	codeFrame.createPlainTextQRCode(code.replace(/\|/g, "")); // Remove manual LB markers
	codeFrame.frameFittingOptions.properties = {
		fittingAlignment: AnchorPoint.CENTER_ANCHOR,
		fittingOnEmptyFrame: EmptyFrameFittingOptions.PROPORTIONALLY,
		topCrop: UnitValue("1.533 mm").as("pt"),
		leftCrop: UnitValue("1.64 mm").as("pt"),
		bottomCrop: UnitValue("1.533 mm").as("pt"),
		rightCrop: UnitValue("1.64 mm").as("pt")
	}
	// codeFrame.localDisplaySetting = DisplaySettingOptions.HIGH_QUALITY;
	codeFrame.epss[0].localDisplaySetting = ViewDisplaySettings.HIGH_QUALITY;
	// Reposition
	var qrGroup = page.groups.add([labelFrame, codeFrame]);
	qrGroup.absoluteRotationAngle = 90;
	page.layoutRule = LayoutRuleOptions.OFF;
	page.reframe(CoordinateSpaces.SPREAD_COORDINATES, [
		qrGroup.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0],
		qrGroup.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0]
	]);
	target.documentPreferences.pageWidth = page.bounds[3] - page.bounds[1];
	target.documentPreferences.pageHeight = page.bounds[2] - page.bounds[0];
	qrGroup.ungroup();
	// Create folder and save file
	var targetFolder = Folder(currentPath + "/QR Codes");
	targetFolder.create();
	var fn = doc.name.substr(0, doc.name.lastIndexOf(".")) + "_QR.indd";
	target.save(File(targetFolder + "/" + fn));
	// Keep file opened if text overflows
	if (labelFrame.overflows) {
		target.textPreferences.showInvisibles = true;
		errors.push(fn + ": Text overflows");
	} else {
		targetPDFFolder = Folder(targetFolder + "/PDFs");
		targetPDFFolder.create();
		ExportToPDF(target, targetPDFFolder + "/" + fn.replace(/\.indd$/ig, ".pdf"));
		target.close();
	}

	function ExportToPDF(doc, path) {
		with(app.pdfExportPreferences) {
			// Basic PDF output options
			pageRange = PageRange.allPages;
			acrobatCompatibility = AcrobatCompatibility.ACROBAT_7;
			exportGuidesAndGrids = false;
			exportLayers = false;
			exportNonprintingObjects = false;
			exportReaderSpreads = true;
			generateThumbnails = false;
			try { ignoreSpreadOverrides = false } catch (e) {}
			includeBookmarks = false;
			includeHyperlinks = false;
			includeICCProfiles = ICCProfiles.INCLUDE_ALL;
			includeSlugWithPDF = true;
			includeStructure = false;
			interactiveElementsOption = InteractiveElementsOptions.APPEARANCE_ONLY;
			subsetFontsBelow = 100;
			// Quality options
			colorBitmapCompression = BitmapCompression.AUTO_COMPRESSION;
			colorBitmapQuality = CompressionQuality.MAXIMUM;
			colorBitmapSampling = Sampling.BICUBIC_DOWNSAMPLE;
			colorBitmapSamplingDPI = 350;
			grayscaleBitmapCompression = BitmapCompression.AUTO_COMPRESSION;
			grayscaleBitmapQuality = CompressionQuality.MAXIMUM;
			grayscaleBitmapSampling = Sampling.BICUBIC_DOWNSAMPLE;
			grayscaleBitmapSamplingDPI = 350;
			monochromeBitmapCompression = MonoBitmapCompression.CCIT4;
			monochromeBitmapSampling = Sampling.BICUBIC_DOWNSAMPLE;
			monochromeBitmapSamplingDPI = 2400;
			thresholdToCompressColor = 350;
			thresholdToCompressGray = 350;
			thresholdToCompressMonochrome = 2400;
			compressionType = PDFCompressionType.COMPRESS_STRUCTURE;
			compressTextAndLineArt = true;
			cropImagesToFrames = true;
			optimizePDF = false;
			// Printers marks and prepress options
			useDocumentBleedWithPDF = true;
			bleedBottom = 0;
			bleedTop = 0;
			bleedInside = 0;
			bleedOutside = 0;
			bleedMarks = false;
			colorBars = false;
			colorTileSize = 128;
			grayTileSize = 128;
			cropMarks = true;
			omitBitmaps = false;
			omitEPS = false;
			omitPDF = false;
			pageInformationMarks = false;
			pdfColorSpace = PDFColorSpace.REPURPOSE_CMYK;
			pdfDestinationProfile = "Coated FOGRA39 (ISO 12647-2:2004)";
			pdfXProfile = "Coated FOGRA39 (ISO 12647-2:2004)";
			standardsCompliance = PDFXStandards.PDFX42010_STANDARD;
			pdfMarkType = MarkTypes.DEFAULT_VALUE;
			pageMarksOffset = 8.50393962860107;
			printerMarkWeight = PDFMarkWeight.P25PT;
			bleedMarks = false;
			registrationMarks = false;
			try { simulateOverprint = false } catch (e) {}
			// Misc
			exportGuidesAndGrids = false;
			exportLayers = false;
			exportWhichLayers = ExportLayerOptions.EXPORT_VISIBLE_PRINTABLE_LAYERS;
			pdfMagnification = PdfMagnificationOptions.DEFAULT_VALUE;
			pdfPageLayout = PageLayoutOptions.DEFAULT_VALUE;
			pdfDisplayTitle = PdfDisplayTitleOptions.DISPLAY_FILE_NAME;
			exportAsSinglePages = false;
			useSecurity = false;
			viewPDF = false;
		}
	doc.exportFile(ExportFormat.pdfType, File(path), false);
	}
}

function BalanceText(txt, length) {
	const WORDS = /((.+?)([ _+\-\u2013\u2014]|[a-z]{2}(?=[A-Z]{1}[a-z])|[a-z]{2}(?=[0-9]{3})))|(.+)/g;
	var wordsArray = txt.match(WORDS);
	alert(wordsArray);
	// 1st pass: roughly join words into lines
	var linesArray = [], lineBuffer = "", word = "";
	while (word = wordsArray.shift()) {
		if ((lineBuffer + word).length <= length) {
			lineBuffer += word;
		} else {
			if (lineBuffer != "") linesArray.push(lineBuffer);
			lineBuffer = word;
		}
	}
	if (lineBuffer != "") linesArray.push(lineBuffer);
	// 2nd pass: balance ragged lines
	if (linesArray.length > 1) BalanceLines();
	return linesArray.join("\u000A");

	function BalanceLines() {
		// Move the last word on the next line and check improvement;
		// if better, save and repeat until no improvement
		for (i = 0; i < linesArray.length - 1; i++) {
			var delta = Math.abs(linesArray[i].length - linesArray[i+1].length);
			var line = linesArray[i].match(WORDS);
			var word = line.pop();
			var newLine1 = line.join("");
			var newLine2 = word + linesArray[i+1];
			var newDelta = Math.abs(newLine1.length - newLine2.length);
			if (newDelta < delta) {
				linesArray[i] = newLine1;
				linesArray[i+1] = newLine2;
				BalanceLines();
			}
		}
	}
}

function MakeIDLayer(doc) {
	var idLayerName = "ID", idLayer = doc.layers.item(idLayerName);
	var hwLayerName = "HW", hwLayer = doc.layers.item(hwLayerName);
	if (!idLayer.isValid) doc.layers.add({
		name: idLayerName,
		layerColor: UIColors.CYAN,
		visible: true,
		locked: false,
		printable: true
	});
	if (hwLayer.isValid)
		idLayer.move(LocationOptions.BEFORE, hwLayer)
		else idLayer.move(LocationOptions.AT_BEGINNING);
	return idLayer;
}

function Margins(page) { // Return page margins
	return {
		top: page.marginPreferences.top,
		left: (page.side == PageSideOptions.LEFT_HAND) ?
			page.marginPreferences.right : page.marginPreferences.left,
		bottom: page.marginPreferences.bottom,
		right: (page.side == PageSideOptions.LEFT_HAND) ?
			page.marginPreferences.left : page.marginPreferences.right
	}
}

// Modified from 'Scrollable alert' by Peter Kahrel
// http://forums.adobe.com/message/2869250#2869250
function AlertScroll(title, input) {
	if (input instanceof Array) input = input.join("\r");
	var lines = input.split(/\r|\n/g);
	var w = new Window("dialog", title);
	var list = w.add("edittext", undefined, input, { multiline: true, scrolling: true, readonly: true });
	list.characters = (function() {
		for (var i = 0, width = 50; i < lines.length; i++) width = Math.max(width, lines[i].length);
		return width;
	})();
	list.minimumSize.height = 100;
	list.maximumSize.height = 880;
	w.add("button", undefined, "Close", { name: "ok" });
	w.show();
}
