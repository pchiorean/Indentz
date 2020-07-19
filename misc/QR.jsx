/*
	QR code v0.1.0-alpha
	© July 2020, Paul Chiorean
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var idLayerName = "id", idLayer = doc.layers.item(idLayerName);
var infoLayerName = "info", infoLayer = doc.layers.item(infoLayerName);
app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

if (!infoLayer.isValid) doc.layers.add({ name: infoLayerName });
infoLayer.properties = {
	layerColor: UIColors.CYAN,
	visible: true,
	locked: false,
	printable: false
};
if (idLayer.isValid) infoLayer.move(LocationOptions.after, idLayer);
else infoLayer.move(LocationOptions.AT_BEGINNING);

var w = new Window("dialog");
	w.text = "QR Code";
	w.orientation = "column";
	w.alignChildren = ["left","top"];
	w.spacing = 10;
	w.margins = 16;
	w.st = w.add("statictext", undefined, undefined, { name: "st" });
	w.st.text = "Enter QR code text:";
var label = w.add('edittext { properties: { name: "label", enterKeySignalsOnChange: true }}');
	label.preferredSize.width = 400;
	label.active = true;
var flg_onfile = w.add("checkbox", undefined, undefined, { name: "flg_onfile" });
	flg_onfile.text = "Save on separate file";
var okcancel = w.add("group", undefined, { name: "okcancel" });
	okcancel.orientation = "row";
	okcancel.alignChildren = ["center","center"];
	okcancel.spacing = 10;
	okcancel.margins = 0;
	okcancel.alignment = ["right","top"];
var cancel = okcancel.add("button", undefined, undefined, { name: "cancel" });
	cancel.text = "Cancel";
var ok = okcancel.add("button", undefined, undefined, { name: "ok" });
	ok.text = "OK";

var result = w.show();
if (result == 2 || !label.text) { exit() };
var QRLabel = label.text;
switch (flg_onfile.value) {
	case true: QRFile(); break;
	case false: QRPage(); break;
}


function QRPage() {
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages.item(i);
		// Delete old items
		for (var j = 0; j < page.pageItems.length; j++)
			if (page.pageItems.item(j).label == "QR") { page.pageItems.item(j).remove(); j-- };
		// Add QR label frame
		var QRLabelFrame = page.textFrames.add({
			itemLayer: infoLayer.name,
			contents: QRLabel,
			label: "QR",
			fillColor: "None"
		});
		QRLabelFrame.paragraphs.everyItem().properties = {
			appliedFont: app.fonts.item("Helvetica Neue\tRegular"),
			pointSize: 5,
			autoLeading: 100,
			horizontalScale: 92,
			tracking: -15,
			capitalization: Capitalization.ALL_CAPS,
			hyphenation: false,
			fillColor: "Black"
		}
		QRLabelFrame.geometricBounds = [
			0, page.bounds[1],
			23.4912600737857, page.bounds[1] + 62.3622047244095
		];
		QRLabelFrame.textFramePreferences.properties = {
			verticalJustification: VerticalJustification.BOTTOM_ALIGN,
			firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
			autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
			autoSizingType: AutoSizingTypeEnum.HEIGHT_ONLY,
			useNoLineBreaksForAutoSizing: true,
			insetSpacing: [7.08661417322835, 7.08661417322835, 2.83464566929134, 0]
		}
		// Add QR code frame
		var QRCodeFrame = page.rectangles.add({
			itemLayer: infoLayer.name,
			label: "QR",
			fillColor: "Paper"
		});
		QRCodeFrame.geometricBounds = [
			23.4912600737857, page.bounds[1] + 6.23622047244442,
			56.94007897142, page.bounds[1] + 39.6850393700788
		];
		QRCodeFrame.createPlainTextQRCode(QRLabel);
		QRCodeFrame.frameFittingOptions.properties = {
			fittingAlignment: AnchorPoint.CENTER_ANCHOR,
			fittingOnEmptyFrame: EmptyFrameFittingOptions.PROPORTIONALLY,
			bottomCrop: 7.26313937552231,
			leftCrop: 7.26313937552231,
			rightCrop: 7.26313937552231,
			topCrop: 7.26313937552231
		}
		QRCodeFrame.absoluteRotationAngle = -90;
		QRCodeFrame.epss[0].localDisplaySetting = ViewDisplaySettings.HIGH_QUALITY;
		var QR = page.groups.add([QRLabelFrame, QRCodeFrame]);
		QR.absoluteRotationAngle = 90;
		doc.align(QR, AlignOptions.LEFT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
		doc.align(QR, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
		QR.ungroup();
	}
}

function QRFile() {
	var QRFile = File(doc.filePath + "/" + 
		doc.name.substr(0, doc.name.lastIndexOf(".")) + "_QR.indd");
	alert(QRFile);
}