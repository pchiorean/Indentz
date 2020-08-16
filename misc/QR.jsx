/*
	QR code v1.7.2
	© August 2020, Paul Chiorean
	Adds a QR code to the current document or to a separate file.
	If "QR.txt" is found, batch process it.
*/

if (app.documents.length == 0) { alert("Open a file and try again."); exit() };
var doc = app.activeDocument;
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

// Look for "QR.txt" and select operating mode
var infoFile = File(doc.filePath + "/QR.txt");
if (infoFile.open("r")) {
	if (confirm("Found \'QR.txt\', do you want to batch process it?")) { BatchQR() } else { ManuallyQR() };
} else { ManuallyQR() };


function BatchQR() { // Noninteractive: batch process "QR.txt"
	var line = 0, err = 0;
	infoFile.readln().split("\t");
	while (!infoFile.eof) {
		var infoLine = infoFile.readln().split("\t"); line++;
		if (!infoLine[0] || !infoLine[1]) { alert ("Missing data in record " + line + "."); exit() };
		// Add extension and '_QR'
		infoLine[0] = infoLine[0].match(/\.indd$/g) ? infoLine[0] : infoLine[0] + '.indd';
		infoLine[0] = infoLine[0].match(/_QR\.indd$/g) ? infoLine[0] : infoLine[0].replace(/\.indd$/g, '_QR.indd');
		// Count files with overflows
		if (QROnFile(infoLine[1], infoLine[0])) err++;
	}
	infoFile.close(); doc.close();
	var msg = "Batch processed " + line + " records from \'QR.txt\'.";
	if (err == 1) msg = msg + "\r" + "One file needs attention.";
	else if (err > 0) msg = msg + "\r" + err + " files need attention.";
	alert(msg);
}

function ManuallyQR() { // Interactive: ask for QR text and destination
	var w = new Window("dialog");
		w.text = "Generate QR Code";
		w.orientation = "column";
		w.alignChildren = ["left", "top"];
		w.spacing = 10;
		w.margins = 16;
		w.st = w.add("statictext", undefined, undefined, { name: "st" });
		w.st.text = "Enter QR code text:";
	var label = w.add('edittext { properties: { name: "label", enterKeySignalsOnChange: true } }');
		label.preferredSize.width = 450;
		label.active = true;
	var flg_onfile = w.add("checkbox", undefined, undefined, { name: "flg_onfile" });
		flg_onfile.text = "Create separate file";
	var okcancel = w.add("group", undefined, { name: "okcancel" });
		okcancel.orientation = "row";
		okcancel.alignChildren = ["center", "center"];
		okcancel.spacing = 10;
		okcancel.margins = 0;
		okcancel.alignment = ["right", "top"];
	var cancel = okcancel.add("button", undefined, undefined, { name: "cancel" });
		cancel.text = "Cancel";
	var ok = okcancel.add("button", undefined, undefined, { name: "ok" });
		ok.text = "OK";
	var result = w.show();
	if (!label.text || result == 2) { exit() };
	var QRLabel = label.text;
	var flg_manual = /\|/g.test(QRLabel); // If "|" found, set forcedLineBreak flag
	switch (flg_onfile.value) {
		case false: QROnPage(QRLabel, flg_manual); break;
		case true: QROnFile(QRLabel); break;
	}
}

function QROnPage(QRLabel, flg_manual) { // Put QR on each page
	QRLabel = QRLabel.toUpperCase(); // Make label uppercase
	QRLabel = QRLabel.replace(/_/g, "_\u200B"); // Add discretionaryLineBreak after "_"
	QRLabel = QRLabel.replace(/\|/g, "\u000A"); // Replace "|" with forcedLineBreak
	var infoLayer = MakeInfoLayer(doc);
	doc.activeLayer = infoLayer;
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages.item(i);
		for (var j = 0; j < page.pageItems.length; j++)
			if (page.pageItems.item(j).label == "QR") { page.pageItems.item(j).remove(); j-- };
		var label = page.textFrames.add({
			itemLayer: infoLayer.name,
			contents: QRLabel,
			label: "QR",
			fillColor: "None"
		});
		label.paragraphs.everyItem().properties = {
			appliedFont: app.fonts.item("Helvetica Neue\tRegular"),
			pointSize: 5,
			autoLeading: 100,
			horizontalScale: 92,
			tracking: -15,
			hyphenation: false,
			fillColor: "Black"
		}
		label.geometricBounds = [0, page.bounds[1], 23.4912600737857, page.bounds[1] + 62.3622047244095];
		label.textFramePreferences.properties = {
			verticalJustification: VerticalJustification.BOTTOM_ALIGN,
			firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
			autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
			autoSizingType: flg_manual ? // If manual LB, set auto
				AutoSizingTypeEnum.HEIGHT_AND_WIDTH :
				AutoSizingTypeEnum.HEIGHT_ONLY,
			useNoLineBreaksForAutoSizing: flg_manual,
			insetSpacing: [7.08661417322835, 7.08661417322835, 2.83464566929134, 0]
		}
		var code = page.rectangles.add({
			itemLayer: infoLayer.name,
			label: "QR",
			fillColor: "Paper"
		});
		code.absoluteRotationAngle = -90;
		code.geometricBounds = [
			23.4912600737857, page.bounds[1] + 6.23622047244442,
			56.94007897142, page.bounds[1] + 39.6850393700788
		];
	code.createPlainTextQRCode(QRLabel.replace(/[|\u000A\u200B]/g, ""));
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
		// Check and, if possible, put QR outside safe area
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

function QROnFile(QRLabel, fn) { // Put QR on 'fn' file
	QRLabel = QRLabel.toUpperCase(); // Make label uppercase
	QRLabel = QRLabel.replace(/_/g, "_\u200B"); // Add discretionaryLineBreak after "_"
	QRLabel = QRLabel.replace(/\|/g, "\u200B"); // Replace "|" with discretionaryLineBreak
	if (!fn) var fn = doc.name.substr(0, doc.name.lastIndexOf(".")) + "_QR.indd";
	var target = app.documents.add();
	var page = target.pages[0];
	var infoLayer = MakeInfoLayer(target);
	var label = page.textFrames.add({
		itemLayer: infoLayer.name,
		contents: QRLabel,
		label: "QR",
		fillColor: "None"
	});
	label.paragraphs.everyItem().properties = {
		appliedFont: app.fonts.item("Helvetica Neue\tRegular"),
		pointSize: 5,
		autoLeading: 100,
		horizontalScale: 92,
		tracking: -15,
		capitalization: Capitalization.ALL_CAPS,
		hyphenation: false,
		fillColor: "Black"
	}
	label.geometricBounds = [0, 0, 16.4046459005573, 56.6929133858268];
	label.textFramePreferences.properties = {
		verticalJustification: VerticalJustification.BOTTOM_ALIGN,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
		autoSizingType: AutoSizingTypeEnum.HEIGHT_ONLY,
		insetSpacing: [2.83464566929134, 2.83464566929134, 0, 1.41732283464567]
	}
	var code = page.rectangles.add({ itemLayer: infoLayer.name, label: "QR" });
	code.absoluteRotationAngle = -90;
	code.geometricBounds = [16.4046459005572, 0, 73.7007874015747, 56.6929133858268];
	code.createPlainTextQRCode(QRLabel.replace(/[|\u000A\u200B]/g, ""));
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
	var targetFolder = Folder(doc.filePath + "/QR Codes");
	targetFolder.create();
	target.save(File(targetFolder + "/" + fn));
	// Keep file opened if text overflows
	if (label.overflows) { return true } else { target.close() };
}

function MakeInfoLayer(doc) {
	var idLayerName = "id", idLayer = doc.layers.item(idLayerName);
	var hwLayerName = "HW", hwLayer = doc.layers.item(hwLayerName);
	var infoLayerName = "info", infoLayer = doc.layers.item(infoLayerName);
	if (!infoLayer.isValid) doc.layers.add({ name: infoLayerName });
	infoLayer.properties = {
		layerColor: UIColors.CYAN,
		visible: true,
		locked: false,
		printable: true
	};
	if (idLayer.isValid) { infoLayer.move(LocationOptions.after, idLayer);
		} else if (hwLayer.isValid) { infoLayer.move(LocationOptions.before, hwLayer);
		} else infoLayer.move(LocationOptions.AT_BEGINNING);
	return infoLayer;
}

function Margins(page) { // Return page margins
	return {
		top: page.marginPreferences.top,
		left: (page.side == PageSideOptions.LEFT_HAND) ? page.marginPreferences.right : page.marginPreferences.left,
		bottom: page.marginPreferences.bottom,
		right: (page.side == PageSideOptions.LEFT_HAND) ? page.marginPreferences.left : page.marginPreferences.right
	}
}