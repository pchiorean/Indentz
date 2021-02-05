/*
	QR code v2.12.1
	© February 2021, Paul Chiorean
	Adds a QR code to the current document or to a separate file.
	If found, batch process "QR.txt". The list is a 2-column TSV
	file with the the following format:

	Filename | Code
	File 1 | CODE 1
	File 2 | CODE 2
	...
*/

app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.enableRedraw = false;
var doc, dPath, infoFile = "", flg_batch = false;
doc = app.documents.length == 0 ? app.documents.add() : app.activeDocument;
if (doc.saved) {
	dPath = doc.filePath;
	if ((infoFile = File(dPath + "/_qr.txt")) && infoFile.exists ||
		(infoFile = File(dPath + "/_QR.txt")) && infoFile.exists ||
		(infoFile = File(dPath + "/qr.txt")) && infoFile.exists ||
		(infoFile = File(dPath + "/QR.txt")) && infoFile.exists) flg_batch = true
}

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "QR code");


function main() {
	var flg_onfile, do_batch;
	var w = new Window("dialog");
		w.text = "Generate QR Code";
		w.orientation = "row";
		w.alignChildren = ["left", "fill"];
	var qpanel = w.add("panel", undefined, undefined, { name: "qpanel" });
		qpanel.orientation = "column";
		qpanel.alignChildren = ["left", "top"];
		qpanel.add("statictext", undefined, "Enter QR code text:", { name: "st" });
	var label = qpanel.add('edittext { properties: { name: "label", enterKeySignalsOnChange: true } }');
		label.text = GetTextFromClipboard();
		label.helpTip = "Use '|' for manual line breaks";
		label.characters = 56;
		label.active = true;
	var flg_white = qpanel.add("checkbox", undefined, "White text", { name: "flg_white" });
		flg_white.helpTip = "Make text white for dark backgrounds (ignored when saving on file)";
	var buttons = w.add("group", undefined, { name: "buttons" });
		buttons.orientation = "column";
		buttons.alignChildren = ["fill", "top"];
	var onpage = buttons.add("button", undefined, "On page", { name: "ok" });
		onpage.helpTip = "Put the code on the bottom-left corner of the page";
	var onfile = buttons.add("button", undefined, "On file", { name: "onfile" });
		onfile.helpTip = !!dPath ?
			"Save as 'QR Codes/" + doc.name.substr(0, doc.name.lastIndexOf(".")) + "_QR.indd'" :
			"Where? Document has no path";
	var batch = buttons.add("button", undefined, "Batch", { name: "batch" });
		batch.helpTip = flg_batch ?
			"Batch process codes from '" + infoFile.name + "'" :
			"No 'QR.txt' found in the current folder";
	onfile.enabled = !!dPath;
	batch.enabled = flg_batch;
	batch.onClick = function() { do_batch = true; w.close() }
	onpage.onClick = function() { flg_onfile = false; w.close() }
	onfile.onClick = function() { flg_onfile = true; w.close() }
	// buttons.add("button", undefined, "Cancel", { name: "cancel" });
	var result = w.show();
	if (result == 2) { exit() }
	if (do_batch) { BatchQR(); exit() }
	var code = label.text.replace(/^\s+/, '').replace(/\s+$/, '');
	if (!code) { alert("No text, no code!"); exit() }
	switch (flg_onfile) {
		case false: QROnPage(code, flg_white.value); exit();
		case true: QROnFile(code); exit();
	}
}

function BatchQR() { // Batch process 'QR.txt'
	infoFile.open("r");
	var infoLine, header, data = [],
		line = 0, flg_H = false, width = 1,
		errors = [], errln, errfn = infoFile.fullName + "\r";
	while (!infoFile.eof) {
		infoLine = infoFile.readln(); line++;
		if (infoLine == "") continue; // Skip empty lines
		if (infoLine.toString().slice(0,1) == "\u0023") continue; // Skip lines beginning with '#'
		infoLine = infoLine.split(/ *\t */);
		if (!flg_H) { header = infoLine; flg_H = true; continue } // 1st line is header
		errln = "Line " + line + ": ";
		if (!infoLine[0]) errors.push(errln + "Missing filename.");
		if (/[\/\\?%*:|"<>]/.test(infoLine[0])) errors.push(errln + "Illegal character in the filename.");
		if (!infoLine[0].match(/\.indd$/ig)) infoLine[0] += ".indd";
		if (!infoLine[0].match(/_QR\.indd$/ig)) infoLine[0] = infoLine[0].replace(/\.indd$/ig, "_QR.indd");
		if (!infoLine[1]) errors.push(errln + "Missing code.");
		width = Math.max(width, infoLine[0].length);
		if (errors.length == 0) data.push({ fn: infoLine[0], qr: infoLine[1] });
	}
	infoFile.close(); infoLine = "";
	if (errors.length > 0) { alert(errfn + errors.join("\n")); exit() }
	if (data.length < 1) { alert(errfn + "Not enough records."); exit() }

	var progressBar = new ProgressBar(width);
	progressBar.reset(data.length);
	for (var i = 0, err = 0; i < data.length; i++) {
		progressBar.update(i + 1, data[i].fn);
		if (QROnFile(data[i].qr, data[i].fn)) err++; // Count files with errors (text overflow)
	}
	progressBar.close();
	if (err != 0) {
		var msg = (err == 1) ? "One file needs attention." : err + " files need attention.";
		alert(msg);
	}
}

function QROnPage(code, flg_white) {
	var idLayer = MakeIDLayer(doc);
	doc.activeLayer = idLayer;
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages.item(i);
		for (var j = 0; j < page.pageItems.length; j++) // Remove old codes
			if (page.pageItems.item(j).label == "QR") { page.pageItems.item(j).remove(); j-- }
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
			fillColor: flg_white ? "Paper" : "Black", // White text
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

function QROnFile(code, fn) {
	if (!fn) var fn = doc.name.substr(0, doc.name.lastIndexOf(".")) + "_QR.indd";
	var target = app.documents.add();
	var page = target.pages[0];
	var idLayer = MakeIDLayer(target);
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
	var targetFolder = Folder(dPath + "/QR Codes");
	targetFolder.create();
	target.save(File(targetFolder + "/" + fn));
	// Keep file opened if text overflows
	if (labelFrame.overflows) {
		target.textPreferences.showInvisibles = true;
		return true;
	} else { target.close() }
}

// Modified from 'Paste and format URL.jsx' by Keith Gilbert
// https://creativepro.com/free-script-to-automate-adding-visible-urls/
function GetTextFromClipboard() {
	var bak_UITool = app.toolBoxTools.currentTool;
	var tmpLayer = doc.layers.add();
	var tmpTextFrame = doc.textFrames.add(tmpLayer);
	tmpTextFrame.insertionPoints[-1].select();
	try {
		app.pasteWithoutFormatting();
		var string = tmpTextFrame.parentStory.contents;
	} catch (_) {
		var string = "";
	}
	tmpTextFrame.remove();
	tmpLayer.remove();
	app.toolBoxTools.currentTool = bak_UITool;
	return string;
}

function BalanceText(txt, width) { // Balance ragged lines
	var re = /((.+?)([ _+\-\u2013\u2014]|[a-z]{2}(?=[A-Z]{1}[a-z])|[a-z]{2}(?=[0-9]{3})))|(.+)/g;
	var wordsArray = txt.match(re); // Break text into 'words'
	// 1st pass: roughly join words into lines
	var linesArray = [], lineBuffer = "", word = "";
	while (word = wordsArray.shift()) {
		if ((lineBuffer + word).length <= width) {
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
			var line = linesArray[i].match(re);
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

function ProgressBar(width) {
	width = Math.max(width, 50);
	var w = new Window("palette", "Batch QR");
	w.pb = w.add("progressbar", [12, 12, ((width + 25) * 6.5), 24], 0, undefined);
	w.st = w.add("statictext", [0, 0, ((width + 25) * 6.5 - 20), 20], undefined, { truncate: "middle" });
	this.reset = function(max) {
		w.pb.value = 0;
		w.pb.maxvalue = max || 0;
		w.pb.visible = !!max;
		w.show();
	}
	this.update = function(val, file) {
		w.pb.value = val;
		w.st.text = "Saving: " + decodeURI(file) + " (" + val + " of " + w.pb.maxvalue + ")";
		w.show(); w.update();
	}
	this.hide = function() { w.hide() }
	this.close = function() { w.close() }
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
