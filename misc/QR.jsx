/*
	QR code v3.5.6 (2021-08-16)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Adds a QR code to the current document or to a separate file.

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

app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.enableRedraw = false;
var doc = app.documents.length == 0 ? app.documents.add() : app.activeDocument;
if (doc.saved) var currentPath = doc.filePath;
var errors = [];

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "QR code");

function main() {
	var onFile;
	var ui = new Window('dialog { alignChildren: [ "left", "fill" ], orientation: "row", text: "Generate QR Code" }');
	ui.qpanel = ui.add('panel { alignChildren: [ "left", "top" ], orientation: "column" }');
	ui.qpanel.add('statictext { properties: { name: "st" }, text: "Enter QR code text:" }');
		ui.label = ui.qpanel.add('edittext { active: true, characters: 56, helpTip: "Use \'|\' for manual line breaks", properties: { enterKeySignalsOnChange: true } }');
		ui.options = ui.qpanel.add('group { margins: [ 0, 5, 0, 0 ], orientation: "row", spacing: 15 }');
			ui.white = ui.options.add('checkbox { helpTip: "Make text white (only on document)", text: "White text" }');
	ui.actions = ui.add('group { alignChildren: [ "fill", "top" ], orientation: "column" }');
		ui.ondoc = ui.actions.add('button { helpTip: "Bottom-left corner of each page", text: "On doc", properties: { name: "ok" } }');
		ui.onfile = ui.actions.add('button { text: "Separate" }');
		ui.onfile.helpTip = !!currentPath ? "QR Codes/" +
			(/\./g.test(doc.name) && doc.name.slice(0, doc.name.lastIndexOf(".")) || doc.name) + "_QR.indd" :
			"Where? Document is not saved";
		ui.actions.add('button { text: "Cancel", properties: { name: "cancel" } }');
		ui.onfile.enabled = !!currentPath;
		ui.ondoc.onClick = function() { onFile = false; ui.close() };
		ui.onfile.onClick = function() { onFile = true; ui.close() };
	if (ui.show() == 2) exit();
	// Processing
	var code = ui.label.text.replace(/^\s+|\s+$/g, "");
	if (!code) { main(); exit() };
	errors = [];
	if (onFile) { MakeQROnFile(code) } else { MakeQROnDoc(code, ui.white.value) };
	if (errors.length > 0) Report(errors, "Errors");
};

function MakeQROnDoc(code, /*bool*/white) {
	var idLayer = MakeIDLayer(doc);
	doc.activeLayer = idLayer;
	for (var i = 0, n = doc.pages.length; i < n; i++) {
		var page = doc.pages.item(i);
		// Remove old codes
		var item, items = page.pageItems.everyItem().getElements();
		while (item = items.shift()) if (item.label == "QR") { item.itemLayer.locked = false; item.remove() };
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
			fillColor: white ? "Paper" : "Black", // White text checkbox
			strokeColor: "None"
		};
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
		};
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
		};
		codeFrame.epss[0].localDisplaySetting = DisplaySettingOptions.HIGH_QUALITY;
		// Reposition
		var qrGroup = page.groups.add([labelFrame, codeFrame]);
		qrGroup.absoluteRotationAngle = 90;
		// If possible, put code outside visible area
		var mgs = Margins(page);
		var szLabel = {
			width: labelFrame.geometricBounds[3] - labelFrame.geometricBounds[1],
			height: labelFrame.geometricBounds[2] - labelFrame.geometricBounds[0]
		};
		var szCode = codeFrame.geometricBounds[3] - codeFrame.geometricBounds[1];
		doc.align(qrGroup, AlignOptions.LEFT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
		doc.align(qrGroup, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
		if ((szLabel.width > mgs.left && szLabel.height > mgs.bottom) ||
			((szLabel.width + szCode) > mgs.left && (szCode + UnitValue("2.3 mm").as("pt")) > mgs.bottom)) {
			doc.align(qrGroup, AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
			doc.align(qrGroup, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		};
		qrGroup.ungroup();
	};
};

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
	};
	labelFrame.geometricBounds = [
		0, 0,
		UnitValue("5.787 mm").as("pt"), UnitValue("20 mm").as("pt")
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
	};
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
	};
	codeFrame.epss[0].localDisplaySetting = DisplaySettingOptions.HIGH_QUALITY;
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
	target.documentPreferences.documentBleedUniformSize = true;
	target.documentPreferences.documentBleedTopOffset = UnitValue("3 mm").as("pt");
	// Export PDF
	var targetFolder = Folder(currentPath + "/QR Codes");
	targetFolder.create();
	var baseName = /\./g.test(doc.name) && doc.name.slice(0, doc.name.lastIndexOf(".")) || doc.name + "_QR";
	var ancillaryFile = File(targetFolder + "/" + baseName + ".indd");
	var pdfFile = File(targetFolder + "/" + baseName + ".pdf");
	if (ancillaryFile.exists) ancillaryFile.remove();
	if (pdfFile.exists) pdfFile.remove();
	if (!labelFrame.overflows) {
		ExportToPDF(target, pdfFile);
		target.close(SaveOptions.NO);
	} else { // If text overflows keep file opened
		target.textPreferences.showInvisibles = true;
		target.save(ancillaryFile);
		errors.push(baseName + ".indd: Text overflows.");
	};
};

function ExportToPDF(doc, path) {
	with(app.pdfExportPreferences) {
		// Output options
		pageRange = PageRange.allPages;
		acrobatCompatibility = AcrobatCompatibility.ACROBAT_7;
		exportAsSinglePages = false;
		exportGuidesAndGrids = false;
		exportLayers = false;
		exportWhichLayers = ExportLayerOptions.EXPORT_VISIBLE_PRINTABLE_LAYERS;
		exportNonprintingObjects = false;
		exportReaderSpreads = true;
		pdfMagnification = PdfMagnificationOptions.DEFAULT_VALUE;
		pdfPageLayout = PageLayoutOptions.DEFAULT_VALUE;
		generateThumbnails = false;
		try { ignoreSpreadOverrides = false } catch (e) {};
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
		bleedBottom = UnitValue("3 mm").as("pt");
		bleedTop = UnitValue("3 mm").as("pt");
		bleedInside = UnitValue("3 mm").as("pt");
		bleedOutside = UnitValue("3 mm").as("pt");
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
		pageMarksOffset = UnitValue("3 mm").as("pt");
		printerMarkWeight = PDFMarkWeight.P25PT;
		bleedMarks = false;
		registrationMarks = false;
		try { simulateOverprint = false } catch (e) {};
		// Misc
		pdfDisplayTitle = PdfDisplayTitleOptions.DISPLAY_FILE_NAME;
		useSecurity = false;
		viewPDF = false;
	};
	doc.exportFile(ExportFormat.pdfType, File(path), false);
};

function BalanceText(txt, length) {
	// 1st pass: break text into words
	const wordRE = /((.+?)([ _+\-\u2013\u2014]|[a-z]{2}(?=[A-Z]{1}[a-z])|[a-z]{2}(?=[0-9]{3})|(?=[([])))|(.+)/g;
	var words = txt.match(wordRE);
	// 2nd pass: roughly join words into lines
	var lines = [], lineBuffer = "", word = "";
	while (word = words.shift()) {
		if ((lineBuffer + word).length <= length) {
			lineBuffer += word;
		} else {
			if (lineBuffer != "") lines.push(lineBuffer);
			lineBuffer = word;
		};
	};
	if (lineBuffer != "") lines.push(lineBuffer);
	// 3rd pass: balance ragged lines
	if (lines.length > 1) BalanceLines();
	return lines.join("\u000A");

	function BalanceLines() {
		// Move the last word on the next line and check improvement;
		// if better, save and repeat until no improvement
		for (var i = 0; i < lines.length - 1; i++) {
			var delta = Math.abs(lines[i].length - lines[i+1].length);
			var line = lines[i].match(wordRE);
			var word = line.pop();
			var newLine1 = line.join("");
			var newLine2 = word + lines[i+1];
			var newDelta = Math.abs(newLine1.length - newLine2.length);
			if (newDelta < delta) {
				lines[i] = newLine1;
				lines[i+1] = newLine2;
				BalanceLines();
			};
		};
	};
};

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
};

function Margins(page) { // Return page margins
	return {
		top: page.marginPreferences.top,
		left: (page.side == PageSideOptions.LEFT_HAND) ?
			page.marginPreferences.right : page.marginPreferences.left,
		bottom: page.marginPreferences.bottom,
		right: (page.side == PageSideOptions.LEFT_HAND) ?
			page.marginPreferences.left : page.marginPreferences.right
	};
};

/**
 * Simple scrollable alert inspired by this snippet by Peter Kahrel:
 * http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250
 * @param {string|string[]} message - Message to be displayed (string or array)
 * @param {string} title - Dialog title
 * @param {boolean} [showFilter] - Shows a filtering field; wildcards: '?' (any char), space and '*' (AND), '|' (OR)
 * @param {boolean} [showCompact] - Sorts message and removes duplicates
 */
function Report(message, title, showFilter, showCompact) {
	if (message instanceof Array) message = message.join("\n"); message = message.split(/\r|\n/g);
	if (showCompact && message.length > 1) {
		message = message.sort();
		for (var i = 1, l = message[0]; i < message.length; l = message[i], i++)
			if (l == message[i] || message[i] == "") { message.splice(i, 1); i-- };
	};
	var w = new Window('dialog', title);
	if (showFilter && message.length > 1) var search = w.add('edittext { characters: 40, \
		helpTip: "Wildcards: \'?\' (any character), space and \'*\' (AND), \'|\' (OR)" }');
	var list = w.add('edittext', undefined, message.join("\n"), { multiline: true, scrolling: true, readonly: true });
	w.add('button { text: "Close", properties: { name: "ok" } }');
	list.characters = function() {
		for (var i = 0, n = message.length, width = 50; i < n;
		width = Math.max(width, message[i].toString().length), i++);
		return width;
	}();
	list.minimumSize.width = 600, list.maximumSize.width = 1024;
	list.minimumSize.height = 100, list.maximumSize.height = 1024;
	w.ok.active = true;
	if (search) {
		search.onChanging = function() {
			if (this.text == "") { list.text = message.join("\n"); w.text = title; return };
			var str = this.text.replace(/[.\[\]{+}]/g, "\\$&"); // Pass through '^*()|?'
			str = str.replace(/\?/g, "."); // '?' -> any character
			if (/[ *]/g.test(str)) str = "(" + str.replace(/ +|\*/g, ").*(") + ")"; // space or '*' -> AND
			str = RegExp(str, "gi");
			for (var i = 0, n = message.length, result = []; i < n; i++) {
				var line = message[i].toString().replace(/^\s+?/g, "");
				if (str.test(line)) result.push(line.replace(/\r|\n/g, "\u00b6").replace(/\t/g, "\\t"));
			};
			w.text = str + " | " + result.length + " record" + (result.length == 1 ? "" : "s");
			if (result.length > 0) { list.text = result.join("\n") } else list.text = "";
		};
	};
	w.show();
};
