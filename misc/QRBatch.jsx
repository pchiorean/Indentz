/*
	Batch QR codes v2.5.1 (2021-06-11)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Adds codes to existing documents or to separate files in batch mode, from a list.
	The list is a 3-column TSV file named "qr.txt" with the following format:

	Filename | Code   | Doc
	File 1   | Code 1 | +
	File 2   | Code 2 |
	...
	1. <Filename>: document name,
	2. <Code>: any string,
	3. <Doc>: any string: on document; empty: separate file.

	The file can be saved in the current folder, on the desktop, or next to the script.
	Blank lines and those prefixed with "#" are ignored.

	TODO:
	- [fix] Check for visible area frame

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
var doc, currentPath, errors;
if (app.documents.length > 0) doc = app.activeDocument;
if (!!doc && doc.saved) currentPath = doc.filePath;
const forbiddenFilenameChars = /[#%^{}\\<>*?\/$!'":@`|=]/g;
const WIN = (File.fs == "Windows");

main();

function main() {
	const LIST = {
		width: 1200,   // pixels
		height: 24,    // lines
		itemHeight: 24 // pixels
	};
	var infoFile, rawData, validLines, queue, pbWidth;
	// User interface
	var ui = new Window("dialog", "Generate QR Codes");
	ui.orientation = "column";
	ui.alignChildren = [ "right", "center" ];
	ui.main = ui.add("group", undefined);
	ui.main.orientation = "column";
	ui.main.alignChildren = [ "fill", "center" ];
	ui.list = ui.main.add('listbox', undefined, undefined, {
		numberOfColumns: 4,
		showHeaders: true,
		columnTitles: [ "#", "Filename", "Code", "Doc" ],
		columnWidths: [ 25, (LIST.width - 72) * 0.7, (LIST.width - 72) * 0.3, 30 ],
		multiselect: true
	});
	ui.list.itemSize[1] = LIST.itemHeight;
	ui.list.size = [ LIST.width, (LIST.itemHeight + 1) * LIST.height + 20 ];
	ui.list.active = true;
	ui.actions = ui.add("group", undefined);
	ui.actions.orientation = "row";
	ui.actions.alignChildren = [ "right", "center" ];
	ui.actions.white = ui.actions.add("checkbox", undefined, "White text");
	ui.actions.white.helpTip = "Make text white (only on documents)";
	ui.actions.white.preferredSize.width = LIST.width - 492;
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
	// UI callback functions
	ui.actions.reload.onClick = function() {
		ui.list.removeAll();
		infoFile = "", rawData = [], validLines = [], errors = [], pbWidth = 64;
		if (/QR Codes$/g.test(decodeURI(currentPath))) currentPath = currentPath.parent;
		if (!!currentPath && (
				(infoFile = File(currentPath + "/_qr.txt")) && infoFile.exists ||
				(infoFile = File(currentPath + "/_QR.txt")) && infoFile.exists ||
				(infoFile = File(currentPath + "/qr.txt"))  && infoFile.exists ||
				(infoFile = File(currentPath + "/QR.txt"))  && infoFile.exists)
			) {
			infoFile.open("r");
			var infoLine, line = 0, flgHeader = false;
			while (!infoFile.eof) {
				var infoLine = "", isEmpty = isComment = isHeader = false;
				infoLine = infoFile.readln(); line++;
				if (infoLine.replace(/^\s+|\s+$/g, "") == "") isEmpty = true
				else if (infoLine.toString().slice(0,1) == "\u0023") isComment = true;
				infoLine = infoLine.split(/ *\t */);
				if (!flgHeader) if (!isEmpty && !isComment) { isHeader = flgHeader = true };
				if (!isEmpty && !isComment && !isHeader) {
					if (infoLine[0] != "") {
						if (forbiddenFilenameChars.test(infoLine[0])) {
							errors.push("Line " + line + ": Forbidden characters in the filename.") };
						infoLine[0] = (infoLine[0].lastIndexOf(".") == -1) ? infoLine[0] :
							infoLine[0].substr(0, infoLine[0].lastIndexOf("."));
						if (!!infoLine[2] && !File(currentPath + "/" + infoLine[0] + ".indd").exists) {
							errors.push("Line " + line + ": File '" + infoLine[0] + ".indd' not found.") };
						if (!infoLine[1]) { errors.push("Line " + line + ": Missing code.") };
						if (!infoLine[2]) infoLine[0] += (/_QR$/ig.test(infoLine[0]) ? "" : "_QR") + ".pdf"
						else infoLine[0] += ".indd";
						if (infoLine[0] != "") pbWidth = Math.max(pbWidth, infoLine[0].length);
					} else { errors.push("Line " + line + ": Missing filename.") };
					if (errors.length == 0) validLines.push(line);
				};
				rawData.push({
					fn: infoLine[0],
					code: infoLine[1],
					pos: infoLine[2],
					valid: (!isEmpty && !isComment && !isHeader),
					exported: false
				});
				if (!isHeader) {
					var l = ui.list.add("item", line);
					l.subItems[0].text = rawData[line-1].fn || "";
					l.subItems[1].text = rawData[line-1].code || "";
					l.subItems[2].text = rawData[line-1].pos ? "+" : "";
				};
			};
			infoFile.close();
			infoLine = "";
		};
		ui.list.onChange();
	};
	ui.list.onChange = function() {
		if (ui.list.selection) {
			queue = [];
			for (var i = 0; i < ui.list.selection.length; i++) {
				for (var j = 0; j < validLines.length; j++) {
					if (Number(ui.list.selection[i].toString()) == validLines[j]) {
						queue.push(Number(ui.list.selection[i].toString()));
						break;
					};
				};
			};
		} else queue = validLines;
		if (queue.length == 0) {
			ui.text = !currentPath ?
				"Select a folder containing the data file" :
				(infoFile.exists ?
					(WIN ? decodeURI(infoFile.fsName) : decodeURI(infoFile.fullName)) + " \u2013 0 records" :
					"No data file in " + decodeURI(currentPath) + "/");
			if (!currentPath) ui.actions.browse.notify();
		} else {
			ui.text = (WIN ? decodeURI(infoFile.fsName) : decodeURI(infoFile.fullName)) + " \u2013 " +
				queue.length + " record" + (queue.length == 1 ? "" : "s") +
				(errors.length > 0 ? " | " + errors.length + " error" + (errors.length == 1 ? "" : "s") : "");
		};
		ui.actions.start.enabled = queue.length > 0 && (errors.length == 0 || ui.list.selection);
		ui.actions.reload.enabled = !!currentPath;
		ui.actions.err.visible = ui.actions.div1.visible = (errors.length > 0);
		if (errors.length > 0) { ui.actions.err.active = true }
		else if (!infoFile.exists) { ui.actions.browse.active = true }
		else if (queue.length == 0 && !ui.list.selection) { ui.actions.reload.active = true }
		else ui.list.active = true;
	};
	ui.list.onDoubleClick = function() { infoFile.execute() };
	ui.actions.err.onClick = function() { Report(errors, "Errors") };
	ui.actions.browse.onClick = function() {
		var folder = Folder.selectDialog("Select a folder containing the data file:");
		if (!!folder && folder != currentPath) {
			if (/QR Codes$/g.test(decodeURI(folder))) folder = folder.parent;
			currentPath = folder;
			ui.actions.reload.onClick();
		};
	};
	ui.onShow = ui.actions.reload.notify();
	// Processing
	if (ui.show() == 2) exit();
	errors = [], isModified = false;
	if (queue.length > 1) var progressBar = new ProgressBar("Processing", pbWidth);
	progressBar && progressBar.reset(queue.length);
	for (var i = 0; i < queue.length; i++) {
		var item = rawData[queue[i]-1];
		if (item.fn == "" || item.fn.toString().slice(0,1) == "\u0023") { progressBar.update(i+1, ""); continue };
		progressBar && progressBar.update(i+1, item.fn);
		if ((item.pos && MakeQROnDoc(item.fn, item.code, ui.actions.white.value)) ||
				(!item.pos && MakeQROnFile(item.fn, item.code))) {
			item.exported = true; isModified = true;
		};
	};
	// Update data file
	progressBar && progressBar.close();
	if (infoFile.exists && isModified && infoFile.open("w")) {
		infoFile.encoding = "UTF-8";
		for (var i = 0; i < rawData.length; i++) {
			infoFile.writeln(
				(rawData[i].exported ? "# " : "") +
				(rawData[i].fn ? rawData[i].fn : "") +
				(rawData[i].code ? "\t" + rawData[i].code : "") +
				(rawData[i].pos ? "\t+" : "")
			);
		};
		infoFile.close();
	};
	if (errors.length > 0) Report(errors, "Errors");
};

function MakeQROnDoc(fn, code, /*bool*/white) {
	var doc = app.open(File(currentPath + "/" + fn));
	var idLayer = MakeIDLayer(doc);
	doc.activeLayer = idLayer;
	for (var i = 0; i < doc.pages.length; i++) {
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
	// doc.save(File(currentPath + "/" + fn));
	doc.save();
	doc.close();
	return true;
};

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
	// Export PDF
	var targetFolder = Folder(currentPath + "/QR Codes");
	targetFolder.create();
	var baseName = fn.substr(0, fn.lastIndexOf("."));
	var ancillaryFile = File(targetFolder + "/" + baseName + ".indd");
	var pdfFile = File(targetFolder + "/" + baseName + ".pdf");
	if (ancillaryFile.exists) ancillaryFile.remove();
	if (pdfFile.exists) pdfFile.remove();
	if (!labelFrame.overflows) {
		ExportToPDF(target, pdfFile);
		target.close(SaveOptions.NO);
		return true;
	} else { // If text overflows keep file opened
		target.textPreferences.showInvisibles = true;
		target.save(ancillaryFile);
		errors.push(baseName + ".indd: Text overflows.");
		return false;
	};
};

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
		pageMarksOffset = UnitValue("3 mm").as("pt");
		printerMarkWeight = PDFMarkWeight.P25PT;
		bleedMarks = false;
		registrationMarks = false;
		try { simulateOverprint = false } catch (e) {};
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
	};
	doc.exportFile(ExportFormat.pdfType, File(path), false);
};

function BalanceText(txt, length) {
	const wordRE = /((.+?)([ _+\-\u2013\u2014]|[a-z]{2}(?=[A-Z]{1}[a-z])|[a-z]{2}(?=[0-9]{3})))|(.+)/g;
	var words = txt.match(wordRE);
	// 1st pass: roughly join words into lines
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
	// 2nd pass: balance ragged lines
	if (lines.length > 1) BalanceLines();
	return lines.join("\u000A");

	function BalanceLines() {
		// Move the last word on the next line and check improvement;
		// if better, save and repeat until no improvement
		for (i = 0; i < lines.length - 1; i++) {
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
};

function ProgressBar(title, width) {
	var pb = new Window("palette", title);
	pb.bar = pb.add("progressbar", undefined, 0, undefined);
	if (!!width) { // Mini progress bar if no width
		pb.msg = pb.add("statictext", undefined, undefined, { truncate: "middle" });
		pb.msg.characters = Math.max(width, 50);
		pb.layout.layout();
		pb.bar.bounds = [ 12, 12, pb.msg.bounds[2], 24 ];
	} else pb.bar.bounds = [ 12, 12, 476, 24 ];
	this.reset = function(max) {
		pb.bar.value = 0;
		pb.bar.maxvalue = max || 0;
		pb.bar.visible = !!max;
		pb.show();
	};
	this.update = function(val, msg) {
		pb.bar.value = val;
		if (!!width) {
			pb.msg.visible = !!msg;
			!!msg && (pb.msg.text = msg);
		};
		pb.text = title + " \u2013 " + val + "/" + pb.bar.maxvalue;
		pb.show(); pb.update();
	};
	this.hide = function() { pb.hide() };
	this.close = function() { pb.close() };
};

function Margins(page) {
	return {
		top: page.marginPreferences.top,
		left: (page.side == PageSideOptions.LEFT_HAND) ?
			page.marginPreferences.right : page.marginPreferences.left,
		bottom: page.marginPreferences.bottom,
		right: (page.side == PageSideOptions.LEFT_HAND) ?
			page.marginPreferences.left : page.marginPreferences.right
	};
};

// Inspired by this scrollable alert by Peter Kahrel:
// http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250
function Report(msg, title, /*bool*/filter, /*bool*/compact) {
	if (msg instanceof Array) msg = msg.join("\n"); msg = msg.split(/\r|\n/g);
	if (compact && msg.length > 1) {
		msg = msg.sort();
		for (var i = 1, l = msg[0]; i < msg.length; l = msg[i], i++)
			if (l == msg[i] || msg[i] == "") msg.splice(i, 1)
	};
	var w = new Window('dialog', title);
	if (filter && msg.length > 1) var search = w.add('edittext { characters: 40, \
		helpTip: "Special operators: \'?\' (any character), space and \'*\' (and), \'|\' (or)" }');
	var list = w.add('edittext', undefined, msg.join("\n"), { multiline: true, scrolling: true, readonly: true });
	w.add('button { text: "Close", properties: { name: "ok" } }');
	list.characters = (function() {
		for (var i = 0, width = 50; i < msg.length;
		width = Math.max(width, msg[i].toString().length), i++);
		return width;
	})();
	list.minimumSize.width = 600, list.maximumSize.width = 1024;
	list.minimumSize.height = 100, list.maximumSize.height = 1024;
	w.ok.active = true;
	if (filter && msg.length > 1) {
		search.onChanging = function() {
			if (this.text == "") { list.text = msg.join("\n"); w.text = title; return };
			var str = this.text.replace(/[.\[\]{+}]/g, "\\$&"); // Pass through '^*()|?'
			str = str.replace(/\?/g, "."); // '?' -> any character
			if (/[ *]/g.test(str)) str = "(" + str.replace(/ +|\*/g, ").*(") + ")"; // space or '*' -> AND
			str = RegExp(str, "gi");
			for (var i = 0, result = []; i < msg.length; i++) {
				var line = msg[i].toString().replace(/^\s+?/g, "");
				if (str.test(line)) result.push(line.replace(/\r|\n/g, "\u00b6").replace(/\t/g, "\\t"));
			};
			w.text = str + " | " + result.length + " record" + (result.length == 1 ? "" : "s");
			if (result.length > 0) { list.text = result.join("\n") } else list.text = "";
		};
	};
	w.show();
};
