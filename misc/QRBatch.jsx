/*
	Batch QR codes v1.0
	© March 2021, Paul Chiorean
	Batch processes "QR.txt" to add codes to existing documents or to separate files.
	The list is a 3-column TSV file with the following format:

	Filename | Code | On doc
	File 1 | Code 1 | *
	File 2 | Code 2 |
	...
	1. <Filename>: document name,
	2. <Code>: any string,
	3. <On doc>: any string: on document; empty: separate file.
*/

app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.enableRedraw = false;
var doc, currentPath, errors = [];
if (app.documents.length > 0) doc = app.activeDocument;
if (doc && doc.saved) currentPath = doc.filePath;

main();

function main() {
	const LW = 1024; // List width (pixels)
	const LH = 25;   // List height (lines)
	const IH = 21;   // List item height (pixels)
	var infoFile, header = [], data = [], pbWidth;
	// User interface
	var ui = new Window("dialog", "Generate QR Codes");
	ui.orientation = "column";
	ui.alignChildren = [ "right", "center" ];
	ui.main = ui.add("group", undefined);
	ui.main.orientation = "column";
	ui.main.alignChildren = [ "fill", "center" ];
	ui.list = ui.main.add('listbox', undefined, undefined, {
		numberOfColumns: 3,
		showHeaders: true,
		columnTitles: [ "Filename", "Code", "On doc" ],
		columnWidths: [ (LW-66) * 0.6574, (LW-66) * 0.3426, 50 ],
		multiselect: true
	});
	ui.list.itemSize[1] = IH;
	ui.list.size = [ LW, (IH+1) * (LH+1) - 1 ];
	ui.list.active = true;
	ui.actions = ui.add("group", undefined);
	ui.actions.orientation = "row";
	ui.actions.alignChildren = [ "right", "center" ];
	ui.actions.white = ui.actions.add("checkbox", undefined, "White text");
	ui.actions.white.helpTip = "Make text white (ignored when separate)";
	ui.actions.white.preferredSize.width = LW-492;
	ui.actions.err = ui.actions.add("button", undefined, "Show errors");
	ui.actions.err.visible = false;
	ui.actions.div1 = ui.actions.add("panel", undefined, undefined);
	ui.actions.div1.alignment = "fill";
	ui.actions.div1.visible = false;
	ui.actions.browse = ui.actions.add("button", undefined, "Browse");
	ui.actions.reload = ui.actions.add("button", undefined, "Reload");
	ui.actions.div2 = ui.actions.add("panel", undefined, undefined);
	ui.actions.div2.alignment = "fill";
	ui.actions.add("button", undefined, "Cancel", { name: "cancel" });
	ui.actions.start = ui.actions.add("button", undefined, "Start", { name: "ok" });
	// UI Functions
	ui.actions.reload.onClick = function() {
		ui.list.removeAll();
		infoFile = "", header = [], data = [], errors = [], pbWidth = 1;
		var infoLine, line = 0, flg_H = false;
		if (!!currentPath &&
			((infoFile = File(currentPath + "/_qr.txt")) && infoFile.exists ||
			(infoFile = File(currentPath + "/_QR.txt")) && infoFile.exists ||
			(infoFile = File(currentPath + "/qr.txt")) && infoFile.exists ||
			(infoFile = File(currentPath + "/QR.txt")) && infoFile.exists)) {
			infoFile.open("r");
			while (!infoFile.eof) {
				infoLine = infoFile.readln(); line++;
				if (infoLine == "") continue; // Skip empty lines
				if (infoLine.toString().slice(0,1) == "\u0023") continue; // Skip lines beginning with '#'
				infoLine = infoLine.split(/ *\t */);
				if (!flg_H) { header = infoLine; flg_H = true; continue } // 1st line is header
				if (!infoLine[0]) errors.push("Line " + line + ": Missing filename.");
				if (/[\/\\?%*:|"<>]/.test(infoLine[0]))
					errors.push("Line " + line + ": Illegal character in the filename.");
				infoLine[2] = !!infoLine[2] || false;
				if (!infoLine[0].match(/\.indd$/ig)) infoLine[0] += ".indd";
				if (infoLine[2] && !File(currentPath + "/" + infoLine[0]).exists)
					errors.push("Line " + line + ": File '" + infoLine[0] + "' not found.");
				if (!infoLine[2] && !infoLine[0].match(/_QR\.indd$/ig))
					infoLine[0] = infoLine[0].replace(/\.indd$/ig, "_QR.indd");
				if (!infoLine[1]) errors.push("Line " + line + ": Missing code.");
				pbWidth = Math.max(pbWidth, infoLine[0].length);
				data.push({ fn: infoLine[0], qr: infoLine[1], pos: infoLine[2] });
			}
			infoFile.close(); infoLine = "";
		}
		if (data.length == 0) {
			ui.text = !currentPath ? "Select a folder containing the data file" :
				(infoFile.exists ? decodeURI(infoFile.fullName) + " – 0 records" :
				"No data file in " + decodeURI(currentPath) + "/");
			if (!currentPath) ui.actions.browse.notify();
		} else {
			for (var i = 0; i < data.length; i++) {
				var l = ui.list.add("item", data[i].fn);
				l.subItems[0].text = data[i].qr;
				l.subItems[1].text = data[i].pos ? "✔︎" : "";
			}
			ui.text = decodeURI(infoFile.fullName) + " – " +
				ui.list.children.length + " record" + (ui.list.children.length > 1 ? "s" : "") +
				(errors.length > 0 ? " | " + errors.length + " error" + (errors.length > 1 ? "s" : "") : "");
		}
		ui.actions.start.enabled = data.length > 0 && errors.length == 0;
		ui.actions.reload.enabled = !!currentPath;
		ui.actions.err.visible = ui.actions.div1.visible = (errors.length > 0);
		if (errors.length > 0) { ui.actions.err.active = true }
		else if (data.length == 0) { ui.actions.browse.active = true }
		else ui.list.active = true;
	}
	ui.list.onDoubleClick = function() { infoFile.execute() }
	ui.actions.err.onClick = function() {
		AlertScroll("Errors", errors.join("\n"));
	}
	ui.actions.browse.onClick = function() {
		var folder = Folder.selectDialog("Select a folder containing the data file:");
		if (!!folder && folder.fullName != currentPath) {
			currentPath = Folder.encode(folder.fullName);
			ui.actions.reload.onClick();
		}
	}
	// Processing
	ui.onShow = ui.actions.reload.notify();
	if (ui.show() == 2) exit();
	errors = [];
	var items = ui.list.selection || data;
	var progressBar = new ProgressBar("Processing", pbWidth);
	progressBar.reset(items.length);
	for (var i = 0; i < items.length; i++) {
		var item = ui.list.selection ? data[items[i].index] : data[i];
		progressBar.update(i+1, item.fn);
		switch (item.pos) {
			case true: MakeQROnDoc(item.fn, item.qr, ui.actions.white.value); break;
			case false: MakeQROnFile(item.fn, item.qr); break;
		}
	}
	progressBar.close();
	if (errors.length > 0) AlertScroll("Errors", errors.join("\n"));
}

function MakeQROnDoc(fn, code, /*bool*/isWhite) {
	var doc = app.open(File(currentPath + "/" + fn));
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
			fillColor: isWhite ? "Paper" : "Black", // White text
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
	doc.save();
	doc.close();
}

function MakeQROnFile(fn, code) {
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
	if (!fn.match(/_QR\.indd$/ig)) fn = fn.replace(/\.indd$/ig, "_QR.indd");
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
			try { pdfDestinationProfile = "ISO Coated v2 (ECI)" } catch (e) {
				pdfDestinationProfile = "Coated FOGRA39 (ISO 12647-2:2004)" };
			try { pdfXProfile = "ISO Coated v2 (ECI)" } catch (e) {
				pdfXProfile = "Coated FOGRA39 (ISO 12647-2:2004)" };
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
		// Move the last word on the next line and test improvement
		for (i = 0; i < linesArray.length - 1; i++) {
			var delta = Math.abs(linesArray[i].length - linesArray[i+1].length);
			var line = linesArray[i].match(WORDS);
			var word = line.pop();
			var newLine1 = line.join("");
			var newLine2 = word + linesArray[i+1];
			var newDelta = Math.abs(newLine1.length - newLine2.length);
			// If better, save and repeat until no improvement
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
	if (!idLayer.isValid) {
		doc.layers.add({
			name: idLayerName,
			layerColor: UIColors.CYAN,
			visible: true,
			locked: false,
			printable: true
		})
	} else idLayer.locked = false;
	if (hwLayer.isValid)
		idLayer.move(LocationOptions.BEFORE, hwLayer)
		else idLayer.move(LocationOptions.AT_BEGINNING);
	return idLayer;
}

function ProgressBar(title, width) {
	var w = new Window("palette", title);
	w.pb = w.add("progressbar", undefined, 0, undefined);
	w.st = w.add("statictext", undefined, undefined, { truncate: "middle" });
	w.st.characters = width;
	w.layout.layout();
	w.pb.bounds = [ 12, 12, w.st.bounds[2], 24 ];
	this.reset = function(max) {
		w.pb.value = 0;
		w.pb.maxvalue = max || 0;
		w.pb.visible = !!max;
		w.show();
	}
	this.update = function(val, file) {
		w.pb.value = val;
		w.st.text = decodeURI(file) + " (" + val + " of " + w.pb.maxvalue + ")";
		w.show(); w.update();
	}
	this.hide = function() { w.hide() }
	this.close = function() { w.close() }
}

function Margins(page) {
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
	for (var i = 1, width = lines[0].length; i < lines.length; i++) width = Math.max(width, lines[i].length);
	var w = new Window("dialog", title);
	var list = w.add("edittext", undefined, input, { multiline: true, scrolling: true, readonly: true });
	list.characters = Math.max(width, 50);
	list.minimumSize.height = 100;
	list.maximumSize.height = 880;
	w.add("button", undefined, "Close", { name: "ok" });
	w.show();
}
