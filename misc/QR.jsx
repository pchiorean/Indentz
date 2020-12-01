/*
	QR code v2.3.1
	© November 2020, Paul Chiorean
	Adds a QR code to the current document or to a separate file.
	If found, batch process "QR.txt". The list is a 2-column TSV
	file with the the following format:

	Filename | Code (header, ignored)
	File 1 | CODE 1
	File 2 | CODE 2
	...
*/

// Add ECMA262-5 string trim method
String.prototype.trim = function() { return this.replace(/^\s+/, '').replace(/\s+$/, '') };

app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
app.scriptPreferences.enableRedraw = false;
var doc, docPath, infoFile, flg_batch = false;
doc = app.documents.length == 0 ? app.documents.add() : app.activeDocument;
if (doc.saved) {
	docPath = doc.filePath;
	infoFile = File(docPath + "/QR.txt");
	if (infoFile.exists) flg_batch = true;
}

app.doScript(main, ScriptLanguage.javascript, undefined, UndoModes.ENTIRE_SCRIPT, "QR code");


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
		// label.text = "Use '|' for manual line breaks";
		label.helpTip = "Use '|' for manual line breaks";
		label.characters = 56;
		label.active = true;
	var flg_white = qpanel.add("checkbox", undefined, "White text", { name: "flg_white" });
		flg_white.helpTip = "Make text white for dark backgrounds (ignored when saving on file)";
	var buttons = w.add("group", undefined, { name: "buttons" });
		buttons.orientation = "column";
		buttons.alignChildren = ["fill", "top"];
	var onpage = buttons.add("button", undefined, "On page", { name: "ok" });
		onpage.helpTip = "Put code on bottom-left corner";
	var onfile = buttons.add("button", undefined, "On file", { name: "onfile" });
		onfile.helpTip = !!docPath ?
			"Save as 'QR Codes/" + doc.name.substr(0, doc.name.lastIndexOf(".")) + "_QR.indd'" :
			"Where? Document has no path";
	var batch = buttons.add("button", undefined, "Batch", { name: "batch" });
		batch.helpTip = flg_batch ? "Batch process codes from 'QR.txt'" : "'QR.txt' file not found in current folder";
	onfile.enabled = !!docPath;
	batch.visible = flg_batch;
	batch.onClick = function() { do_batch = true; w.close() }
	onpage.onClick = function() { flg_onfile = false; w.close() }
	onfile.onClick = function() { flg_onfile = true; w.close() }
	// buttons.add("button", undefined, "Cancel", { name: "cancel" });
	var result = w.show();
	if (result == 2) { exit() }
	if (do_batch) { BatchQR(); exit() }
	var QRLabel = label.text.trim();
	if (!QRLabel) { alert("No text, no code!"); exit() }
	switch (flg_onfile) {
		case false: QROnPage(QRLabel, flg_white.value); exit();
		case true: QROnFile(QRLabel); exit();
	}
}

function BatchQR() { // Batch process 'QR.txt'
	infoFile.open("r");
	var line = 0, fn = [], qr = [], width = 100;
	var header = infoFile.readln().split("\t");
	while (!infoFile.eof) {
		var infoLine = infoFile.readln().split("\t");
		if (infoLine[0].toString().slice(0,1) == "\u0023") continue; // Skip lines beginning with '#'
		if (!infoLine[0] && !infoLine[1]) continue; // Skip empty lines
		line++;
		if (!infoLine[0]) { alert ("Missing " + header[0] + " in record " + line + "."); exit() }
		if (!infoLine[1]) { alert ("Missing " + header[1] + " in record " + line + "."); exit() }
		infoLine[0] = infoLine[0].trim();
		if (!infoLine[0].match(/\.indd$/ig)) infoLine[0] += '.indd';
		fn[line-1] = infoLine[0].match(/_QR\.indd$/ig) ? infoLine[0] : infoLine[0].replace(/\.indd$/ig, '_QR.indd');
		qr[line-1] = infoLine[1].trim();
		width = (qr[line-1] > width) ? qr[line-1] : width;
	}
	infoFile.close(); //doc.close();
	if (line < 1) { alert("Not enough records."); exit() }
	var progressBar = new ProgressBar(width); progressBar.reset(line);
	for (var i = 0, err = 0; i < line; i++) {
		var QRLabel = qr[i];
		progressBar.update(i + 1, QRLabel.replace(/[|\u000A\u200B]/g, ""));
		if (QROnFile(QRLabel, fn[i])) err++; // Count files with errors (text overflow)
	}
	progressBar.close();
	if (err != 0) {
		var msg = (err == 1) ? "One file needs attention." : err + " files need attention.";
		alert(msg);
	}
}

function QROnPage(QRLabel, flg_white) {
	var flg_manual = /\|/g.test(QRLabel); // If '|' found, set manual LB flag
	QRLabel = QRLabel.toUpperCase();
	// Add SpecialCharacters.DISCRETIONARY_LINE_BREAK after '_'
	QRLabel = QRLabel.replace(/([A-Za-z0-9)-]{3,})_([A-Za-z0-9(]{3,})/g, "$1_\u200B$2");
	// Replace '|' with SpecialCharacters.FORCED_LINE_BREAK
	QRLabel = QRLabel.replace(/\|/g, "\u000A");
	var idLayer = MakeIDLayer(doc);
	doc.activeLayer = idLayer;
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages.item(i);
		for (var j = 0; j < page.pageItems.length; j++) // Remove old codes
			if (page.pageItems.item(j).label == "QR") { page.pageItems.item(j).remove(); j-- }
		var label = page.textFrames.add({
			itemLayer: idLayer.name,
			contents: QRLabel,
			label: "QR",
			fillColor: "None",
			strokeColor: "None"
		});
		label.paragraphs.everyItem().properties = {
			appliedFont: app.fonts.item("Helvetica Neue\tRegular"),
			pointSize: 5,
			autoLeading: 100,
			horizontalScale: 92,
			tracking: -15,
			hyphenation: false,
			balanceRaggedLines: BalanceLinesStyle.FULLY_BALANCED,
			fillColor: flg_white ? "Paper" : "Black", // White text
			strokeColor: "None"
		}
		label.geometricBounds = [0, page.bounds[1], 24.9085829084314, page.bounds[1] + 61.0988746102401];
		label.textFramePreferences.properties = {
			verticalJustification: VerticalJustification.BOTTOM_ALIGN,
			firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
			useNoLineBreaksForAutoSizing: (flg_manual || (label.lines.length == 1 && label.lines[0].characters.length <= 18)),
			insetSpacing: [UnitValue("3mm").as('pt'), UnitValue("2.5mm").as('pt'), UnitValue("1mm").as('pt'), 0]
		}
		label.textFramePreferences.properties = {
			autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
			// autoSizingType: (flg_manual || label.lines.length == 1) ?
			// 	AutoSizingTypeEnum.HEIGHT_AND_WIDTH : AutoSizingTypeEnum.HEIGHT_ONLY
			autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH
		}
		var code = page.rectangles.add({
			itemLayer: idLayer.name,
			label: "QR",
			fillColor: "Paper",
			strokeColor: "None"
		});
		code.absoluteRotationAngle = -90;
		code.geometricBounds = [
			24.9085829084314, page.bounds[1] + 6.51968503937007,
			58.3574018060656, page.bounds[1] + 39.9685039370045
		];
		code.createPlainTextQRCode(QRLabel.replace(/[|\u000A\u200B]/g, "")); // Cleanup code text
		code.frameFittingOptions.properties = {
			fittingAlignment: AnchorPoint.CENTER_ANCHOR,
			fittingOnEmptyFrame: EmptyFrameFittingOptions.PROPORTIONALLY,
			topCrop: 7.26313937552231,
			leftCrop: 7.26313937552231,
			bottomCrop: 7.26313937552231,
			rightCrop: 7.26313937552231
		}
		code.epss[0].localDisplaySetting = ViewDisplaySettings.HIGH_QUALITY;
		var QR = page.groups.add([label, code]);
		QR.absoluteRotationAngle = 90;
		// If possible, put QR outside safe area
		var mgs = Margins(page);
		var szLabel = {
			width: label.geometricBounds[3] - label.geometricBounds[1],
			height: label.geometricBounds[2] - label.geometricBounds[0]
		}
		var szCode = {
			width: code.geometricBounds[3] - code.geometricBounds[1],
			height: code.geometricBounds[2] - code.geometricBounds[0]
		}
		if ((mgs.left >= szLabel.width + szCode.width - 1.45) ||
			(mgs.bottom >= szCode.height + 6.23622047244442 - 1.45)) {
				doc.align(QR, AlignOptions.LEFT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
				doc.align(QR, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
			} else {
				doc.align(QR, AlignOptions.LEFT_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
				doc.align(QR, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		}
		QR.ungroup();
	}
}

function QROnFile(QRLabel, fn) {
	QRLabel = QRLabel.toUpperCase();
	// Add SpecialCharacters.DISCRETIONARY_LINE_BREAK after '_'
	QRLabel = QRLabel.replace(/([A-Za-z0-9)-]{3,})_([A-Za-z0-9(]{3,})/g, "$1_\u200B$2");
	// Replace '|' with SpecialCharacters.FORCED_LINE_BREAK
	QRLabel = QRLabel.replace(/\|/g, "\u000A");
	if (!fn) var fn = doc.name.substr(0, doc.name.lastIndexOf(".")) + "_QR.indd";
	var target = app.documents.add();
	var page = target.pages[0];
	var idLayer = MakeIDLayer(target);
	var label = page.textFrames.add({
		itemLayer: idLayer.name,
		contents: QRLabel,
		label: "QR",
		fillColor: "None",
		strokeColor: "None"
	});
	label.paragraphs.everyItem().properties = {
		appliedFont: app.fonts.item("Helvetica Neue\tRegular"),
		pointSize: 5,
		autoLeading: 100,
		horizontalScale: 92,
		tracking: -15,
		capitalization: Capitalization.ALL_CAPS,
		hyphenation: false,
		balanceRaggedLines: BalanceLinesStyle.FULLY_BALANCED,
		fillColor: "Black"
	}
	label.geometricBounds = [0, 0, 16.4046459005573, 56.6929133858268];
	label.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.BOTTOM_ALIGN,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
		autoSizingType: AutoSizingTypeEnum.HEIGHT_ONLY,
		insetSpacing: [UnitValue("1mm").as('pt'), UnitValue("1mm").as('pt'), 0, UnitValue("0.5mm").as('pt')]
	}
	var code = page.rectangles.add({ itemLayer: idLayer.name, label: "QR" });
	code.absoluteRotationAngle = -90;
	code.geometricBounds = [16.4046459005572, 0, 73.7007874015747, 56.6929133858268];
	code.createPlainTextQRCode(QRLabel.replace(/[|\u000A\u200B]/g, "")); // Cleanup code text
	code.frameFittingOptions.properties = {
		fittingAlignment: AnchorPoint.CENTER_ANCHOR,
		fittingOnEmptyFrame: EmptyFrameFittingOptions.PROPORTIONALLY,
		topCrop: 4.97468772366082,
		leftCrop: 4.57520063728848,
		bottomCrop: 4.97468772366082,
		rightCrop: 4.57520063728848
	}
	code.epss[0].localDisplaySetting = ViewDisplaySettings.HIGH_QUALITY;
	var QR = page.groups.add([label, code]);
	QR.absoluteRotationAngle = 90;
	page.layoutRule = LayoutRuleOptions.OFF;
	page.reframe(CoordinateSpaces.SPREAD_COORDINATES, [
		QR.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0],
		QR.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0]
	]);
	target.documentPreferences.pageWidth = page.bounds[3] - page.bounds[1];
	target.documentPreferences.pageHeight = page.bounds[2] - page.bounds[0];
	QR.ungroup();
	// Create folder and save file
	var targetFolder = Folder(docPath + "/QR Codes");
	targetFolder.create();
	target.save(File(targetFolder + "/" + fn));
	// Keep file opened if text overflows
	if (label.overflows) {
		target.textPreferences.showInvisibles = true;
		return true;
	} else { target.close() }
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
	var w = new Window("palette", "Batch Resize: " + decodeURI(infoFile.name));
	w.pb = w.add("progressbar", [12, 12, (width * 5), 24], 0, undefined);
	w.st = w.add("statictext", [0, 0, (width * 5 - 20), 20], undefined, { truncate: "middle" });
	this.reset = function(max) {
		w.pb.value = 0;
		w.pb.maxvalue = max || 0;
		w.pb.visible = !!max;
		w.show();
	}
	this.update = function(val, code) {
		w.pb.value = val;
		w.st.text = "Processing '" + code + "' (" + val + " of " + w.pb.maxvalue + ")";
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
