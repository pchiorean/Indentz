/*
	QR code v3.5.7 (2021-09-12)
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

doc = (app.documents.length === 0) ? app.documents.add() : app.activeDocument;
var currentPath = doc.saved ? doc.filePath : '';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'QR code');

function main() {
	var code, onFile;
	var errors = [];
	app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
	app.scriptPreferences.enableRedraw = false;

	// User interface
	var ui = new Window('dialog { alignChildren: [ "left", "fill" ], orientation: "row", text: "Generate QR Code" }');
	ui.qpanel = ui.add('panel { alignChildren: [ "left", "top" ], orientation: "column" }');
	ui.qpanel.add('statictext { properties: { name: "st" }, text: "Enter QR code text:" }');
		ui.label = ui.qpanel.add('edittext { active: true, characters: 56, helpTip: "Use \'|\' for manual line breaks", properties: { enterKeySignalsOnChange: true } }');
		ui.options = ui.qpanel.add('group { margins: [ 0, 5, 0, 0 ], orientation: "row", spacing: 15 }');
			ui.white = ui.options.add('checkbox { helpTip: "Make text white (only on document)", text: "White text" }');
	ui.actions = ui.add('group { alignChildren: [ "fill", "top" ], orientation: "column" }');
		ui.ondoc = ui.actions.add('button { helpTip: "Bottom-left corner of each page", text: "On doc", properties: { name: "ok" } }');
		ui.onfile = ui.actions.add('button { text: "Separate" }');
		ui.onfile.helpTip = currentPath ? 'QR Codes/' +
			((/\./g.test(doc.name) && doc.name.slice(0, doc.name.lastIndexOf('.'))) || doc.name) + '_QR.indd' :
			'Where? Document is not saved';
		ui.actions.add('button { text: "Cancel", properties: { name: "cancel" } }');
		ui.onfile.enabled = !!currentPath;
		ui.ondoc.onClick  = function () { onFile = false; ui.close(); };
		ui.onfile.onClick = function () { onFile = true;  ui.close(); };
	if (ui.show() === 2) exit();

	// Processing
	code = ui.label.text.replace(/^\s+|\s+$/g, '');
	if (!code) { main(); exit(); }
	if (onFile) makeQROnFile(code); else makeQROnDoc(code, ui.white.value);
	if (errors.length > 0) report(errors, 'Errors');
}

function makeQROnDoc(code, /*bool*/white) {
	var item, items, mgs, page, labelFrame, codeFrame, qrGroup, szLabel, szCode;
	var idLayer = makeIDLayer(doc);
	doc.activeLayer = idLayer;
	for (var i = 0, n = doc.pages.length; i < n; i++) {
		page = doc.pages.item(i);
		mgs = pageMargins(page);
		// Remove old codes
		items = page.pageItems.everyItem().getElements();
		while ((item = items.shift())) if (item.label === 'QR') { item.itemLayer.locked = false; item.remove(); }
		// Add label
		labelFrame = page.textFrames.add({
			label:       'QR',
			itemLayer:   idLayer.name,
			fillColor:   'None',
			strokeColor: 'None',
			contents:    /\|/g.test(code) ?     // If '|' found
				code.replace(/\|/g, '\u000A') : // replace it with Forced Line Break
				balanceText(code, 20)           // else auto balance text
		});
		labelFrame.paragraphs.everyItem().properties = {
			appliedFont:     app.fonts.item('Helvetica Neue\tRegular'),
			pointSize:       '5 pt',
			autoLeading:     100,
			horizontalScale: 92,
			tracking:        -15,
			hyphenation:     false,
			capitalization:  Capitalization.ALL_CAPS,
			fillColor:       white ? 'Paper' : 'Black', // White text checkbox
			strokeColor:     'None'
		};
		labelFrame.textFramePreferences.properties = {
			verticalJustification:        VerticalJustification.BOTTOM_ALIGN,
			firstBaselineOffset:          FirstBaseline.CAP_HEIGHT,
			autoSizingReferencePoint:     AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
			autoSizingType:               AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
			useNoLineBreaksForAutoSizing: true,
			insetSpacing: [
				UnitValue('3 mm').as('pt'),
				UnitValue('2.5 mm').as('pt'),
				UnitValue('1 mm').as('pt'),
				0
			]
		};
		doc.align(labelFrame, AlignOptions.LEFT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
		doc.align(labelFrame, AlignOptions.TOP_EDGES,  AlignDistributeBounds.PAGE_BOUNDS);
		// Add code
		codeFrame = page.rectangles.add({
			itemLayer:   idLayer.name,
			label:       'QR',
			fillColor:   'Paper',
			strokeColor: 'None'
		});
		codeFrame.absoluteRotationAngle = -90;
		codeFrame.geometricBounds = [
			labelFrame.geometricBounds[2],
			page.bounds[1] + UnitValue('2.3 mm').as('pt'),
			labelFrame.geometricBounds[2] + UnitValue('11.8 mm').as('pt'),
			page.bounds[1] + UnitValue('14.1 mm').as('pt')
		];
		codeFrame.createPlainTextQRCode(code.replace(/\|/g, '')); // Remove manual LB markers
		codeFrame.frameFittingOptions.properties = {
			fittingAlignment:    AnchorPoint.CENTER_ANCHOR,
			fittingOnEmptyFrame: EmptyFrameFittingOptions.PROPORTIONALLY,
			topCrop:             UnitValue('2.7 mm').as('pt'),
			leftCrop:            UnitValue('2.7 mm').as('pt'),
			bottomCrop:          UnitValue('2.7 mm').as('pt'),
			rightCrop:           UnitValue('2.7 mm').as('pt')
		};
		codeFrame.epss[0].localDisplaySetting = DisplaySettingOptions.HIGH_QUALITY;
		// Reposition
		qrGroup = page.groups.add([ labelFrame, codeFrame ]);
		qrGroup.absoluteRotationAngle = 90;
		// Try to put code outside visible area
		szLabel = {
			width:  labelFrame.geometricBounds[3] - labelFrame.geometricBounds[1],
			height: labelFrame.geometricBounds[2] - labelFrame.geometricBounds[0]
		};
		szCode = codeFrame.geometricBounds[3] - codeFrame.geometricBounds[1];
		doc.align(qrGroup, AlignOptions.LEFT_EDGES,   AlignDistributeBounds.PAGE_BOUNDS);
		doc.align(qrGroup, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
		if ((szLabel.width > mgs.left && szLabel.height > mgs.bottom) ||
			((szLabel.width + szCode) > mgs.left && (szCode + UnitValue('2.3 mm').as('pt')) > mgs.bottom)) {
			doc.align(qrGroup, AlignOptions.LEFT_EDGES,   AlignDistributeBounds.MARGIN_BOUNDS);
			doc.align(qrGroup, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.MARGIN_BOUNDS);
		}
		qrGroup.ungroup();
	}
}

function makeQROnFile(code) {
	var labelFrame, codeFrame, qrGroup, targetFolder, baseName, ancillaryFile, pdfFile;
	var target = app.documents.add();
	var page = target.pages[0];
	var idLayer = makeIDLayer(target);
	// Add label
	labelFrame = page.textFrames.add({
		label:       'QR',
		itemLayer:    idLayer.name,
		fillColor:   'None',
		strokeColor: 'None',
		contents:    /\|/g.test(code) ?     // If '|' found
			code.replace(/\|/g, '\u000A') : // replace it with Forced Line Break
			balanceText(code, 18)           // else auto balance text
	});
	labelFrame.paragraphs.everyItem().properties = {
		appliedFont: app.fonts.item('Helvetica Neue\tRegular'),
		pointSize:       '5 pt',
		autoLeading:     100,
		horizontalScale: 92,
		tracking:        -15,
		capitalization:  Capitalization.ALL_CAPS,
		hyphenation:     false,
		fillColor:       'Black'
	};
	labelFrame.geometricBounds = [
		0,
		0,
		UnitValue('5.787 mm').as('pt'),
		UnitValue('20 mm').as('pt')
	];
	labelFrame.textFramePreferences.properties = {
		verticalJustification:    VerticalJustification.BOTTOM_ALIGN,
		firstBaselineOffset:      FirstBaseline.CAP_HEIGHT,
		autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
		autoSizingType:           AutoSizingTypeEnum.HEIGHT_ONLY,
		insetSpacing: [
			UnitValue('1 mm').as('pt'),
			UnitValue('1 mm').as('pt'),
			0,
			UnitValue('0.5 mm').as('pt')
		]
	};
	// Add code
	codeFrame = page.rectangles.add({ itemLayer: idLayer.name, label: 'QR' });
	codeFrame.absoluteRotationAngle = -90;
	codeFrame.geometricBounds = [
		UnitValue('5.787 mm').as('pt'),
		0,
		UnitValue('26 mm').as('pt'),
		UnitValue('20 mm').as('pt')
	];
	codeFrame.createPlainTextQRCode(code.replace(/\|/g, '')); // Remove manual LB markers
	codeFrame.frameFittingOptions.properties = {
		fittingAlignment:    AnchorPoint.CENTER_ANCHOR,
		fittingOnEmptyFrame: EmptyFrameFittingOptions.PROPORTIONALLY,
		topCrop:             UnitValue('1.533 mm').as('pt'),
		leftCrop:            UnitValue('1.64 mm').as('pt'),
		bottomCrop:          UnitValue('1.533 mm').as('pt'),
		rightCrop:           UnitValue('1.64 mm').as('pt')
	};
	codeFrame.epss[0].localDisplaySetting = DisplaySettingOptions.HIGH_QUALITY;
	// Reposition
	qrGroup = page.groups.add([ labelFrame, codeFrame ]);
	qrGroup.absoluteRotationAngle = 90;
	page.layoutRule = LayoutRuleOptions.OFF;
	page.reframe(CoordinateSpaces.SPREAD_COORDINATES, [
		qrGroup.resolve(AnchorPoint.TOP_LEFT_ANCHOR,     CoordinateSpaces.SPREAD_COORDINATES)[0],
		qrGroup.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0]
	]);
	target.documentPreferences.pageWidth  = page.bounds[3] - page.bounds[1];
	target.documentPreferences.pageHeight = page.bounds[2] - page.bounds[0];
	qrGroup.ungroup();
	target.documentPreferences.documentBleedUniformSize = true;
	target.documentPreferences.documentBleedTopOffset   = UnitValue('3 mm').as('pt');
	// Export PDF
	targetFolder = Folder(currentPath + '/QR Codes');
	targetFolder.create();
	baseName = (/\./g.test(doc.name) && doc.name.slice(0, doc.name.lastIndexOf('.'))) || doc.name + '_QR';
	ancillaryFile = File(targetFolder + '/' + baseName + '.indd');
	pdfFile = File(targetFolder + '/' + baseName + '.pdf');
	if (ancillaryFile.exists) ancillaryFile.remove();
	if (pdfFile.exists) pdfFile.remove();
	if (labelFrame.overflows) {
		// If text overflows keep file opened
		target.textPreferences.showInvisibles = true;
		target.save(ancillaryFile);
		errors.push(baseName + '.indd: Text overflows.');
		return false;
	}
	setPDFExportPreferences();
	target.exportFile(ExportFormat.pdfType, File(pdfFile), false);
	target.close(SaveOptions.NO);
	return true;

	function setPDFExportPreferences() {
		// Output options
		app.pdfExportPreferences.pageRange                     = PageRange.ALL_PAGES;
		app.pdfExportPreferences.acrobatCompatibility          = AcrobatCompatibility.ACROBAT_7;
		app.pdfExportPreferences.exportAsSinglePages           = false;
		app.pdfExportPreferences.exportGuidesAndGrids          = false;
		app.pdfExportPreferences.exportLayers                  = false;
		app.pdfExportPreferences.exportWhichLayers             = ExportLayerOptions.EXPORT_VISIBLE_PRINTABLE_LAYERS;
		app.pdfExportPreferences.exportNonprintingObjects      = false;
		app.pdfExportPreferences.exportReaderSpreads           = true;
		app.pdfExportPreferences.pdfMagnification              = PdfMagnificationOptions.DEFAULT_VALUE;
		app.pdfExportPreferences.pdfPageLayout                 = PageLayoutOptions.DEFAULT_VALUE;
		app.pdfExportPreferences.generateThumbnails            = false;
		try { app.pdfExportPreferences.ignoreSpreadOverrides   = false; } catch (e) {}
		app.pdfExportPreferences.includeBookmarks              = false;
		app.pdfExportPreferences.includeHyperlinks             = false;
		app.pdfExportPreferences.includeICCProfiles            = ICCProfiles.INCLUDE_ALL;
		app.pdfExportPreferences.includeSlugWithPDF            = true;
		app.pdfExportPreferences.includeStructure              = false;
		app.pdfExportPreferences.interactiveElementsOption     = InteractiveElementsOptions.APPEARANCE_ONLY;
		app.pdfExportPreferences.subsetFontsBelow              = 100;
		// Quality options
		app.pdfExportPreferences.colorBitmapCompression        = BitmapCompression.AUTO_COMPRESSION;
		app.pdfExportPreferences.colorBitmapQuality            = CompressionQuality.MAXIMUM;
		app.pdfExportPreferences.colorBitmapSampling           = Sampling.BICUBIC_DOWNSAMPLE;
		app.pdfExportPreferences.colorBitmapSamplingDPI        = 350;
		app.pdfExportPreferences.grayscaleBitmapCompression    = BitmapCompression.AUTO_COMPRESSION;
		app.pdfExportPreferences.grayscaleBitmapQuality        = CompressionQuality.MAXIMUM;
		app.pdfExportPreferences.grayscaleBitmapSampling       = Sampling.BICUBIC_DOWNSAMPLE;
		app.pdfExportPreferences.grayscaleBitmapSamplingDPI    = 350;
		app.pdfExportPreferences.monochromeBitmapCompression   = MonoBitmapCompression.CCIT4;
		app.pdfExportPreferences.monochromeBitmapSampling      = Sampling.BICUBIC_DOWNSAMPLE;
		app.pdfExportPreferences.monochromeBitmapSamplingDPI   = 2400;
		app.pdfExportPreferences.thresholdToCompressColor      = 350;
		app.pdfExportPreferences.thresholdToCompressGray       = 350;
		app.pdfExportPreferences.thresholdToCompressMonochrome = 2400;
		app.pdfExportPreferences.compressionType               = PDFCompressionType.COMPRESS_STRUCTURE;
		app.pdfExportPreferences.compressTextAndLineArt        = true;
		app.pdfExportPreferences.cropImagesToFrames            = true;
		app.pdfExportPreferences.optimizePDF                   = false;
		// Printers marks and prepress options
		app.pdfExportPreferences.useDocumentBleedWithPDF       = true;
		app.pdfExportPreferences.bleedBottom                   = UnitValue('3 mm').as('pt');
		app.pdfExportPreferences.bleedTop                      = UnitValue('3 mm').as('pt');
		app.pdfExportPreferences.bleedInside                   = UnitValue('3 mm').as('pt');
		app.pdfExportPreferences.bleedOutside                  = UnitValue('3 mm').as('pt');
		app.pdfExportPreferences.colorBars                     = false;
		app.pdfExportPreferences.colorTileSize                 = 128;
		app.pdfExportPreferences.grayTileSize                  = 128;
		app.pdfExportPreferences.cropMarks                     = true;
		app.pdfExportPreferences.omitBitmaps                   = false;
		app.pdfExportPreferences.omitEPS                       = false;
		app.pdfExportPreferences.omitPDF                       = false;
		app.pdfExportPreferences.pageInformationMarks          = false;
		app.pdfExportPreferences.pdfColorSpace                 = PDFColorSpace.REPURPOSE_CMYK;
		app.pdfExportPreferences.pdfDestinationProfile         = 'Coated FOGRA39 (ISO 12647-2:2004)';
		app.pdfExportPreferences.pdfXProfile                   = 'Coated FOGRA39 (ISO 12647-2:2004)';
		app.pdfExportPreferences.standardsCompliance           = PDFXStandards.PDFX42010_STANDARD;
		app.pdfExportPreferences.pdfMarkType                   = MarkTypes.DEFAULT_VALUE;
		app.pdfExportPreferences.pageMarksOffset               = UnitValue('3 mm').as('pt');
		app.pdfExportPreferences.printerMarkWeight             = PDFMarkWeight.P25PT;
		app.pdfExportPreferences.bleedMarks                    = false;
		app.pdfExportPreferences.registrationMarks             = false;
		try { app.pdfExportPreferences.simulateOverprint       = false; } catch (e) {}
		// Misc
		app.pdfExportPreferences.pdfDisplayTitle               = PdfDisplayTitleOptions.DISPLAY_FILE_NAME;
		app.pdfExportPreferences.useSecurity                   = false;
		app.pdfExportPreferences.viewPDF                       = false;
	}
}


function balanceText(txt, length) {
	var lineBuffer = '';
	var lines = [];
	var word = '';
	var words = [];
	// 1st pass: break text into words
	var wordRE = /((.+?)([ _+\-\u2013\u2014]|[a-z]{2}(?=[A-Z]{1}[a-z])|[a-z]{2}(?=[0-9]{3})|(?=[([])))|(.+)/g;
	words = txt.match(wordRE);
	// 2nd pass: roughly join words into lines
	while ((word = words.shift())) {
		if ((lineBuffer + word).length <= length) {
			lineBuffer += word;
		} else {
			if (lineBuffer !== '') lines.push(lineBuffer);
			lineBuffer = word;
		}
	}
	if (lineBuffer !== '') lines.push(lineBuffer);
	// 3rd pass: balance ragged lines
	if (lines.length > 1) balanceLines();
	return lines.join('\u000A');

	// Move the last word on the next line and check improvement;
	// if better, save and repeat until no improvement
	function balanceLines() {
		var delta, line, w, newLine1, newLine2;
		for (var i = 0; i < lines.length - 1; i++) {
			delta = Math.abs(lines[i].length - lines[i + 1].length);
			line = lines[i].match(wordRE);
			w = line.pop();
			newLine1 = line.join('');
			newLine2 = w + lines[i + 1];
			if (Math.abs(newLine1.length - newLine2.length) < delta) {
				lines[i] = newLine1;
				lines[i + 1] = newLine2;
				balanceLines();
			}
		}
	}
}

function makeIDLayer(document) {
	var idLayerName = 'ID';
	var idLayer = document.layers.item(idLayerName);
	var hwLayerName = 'HW';
	var hwLayer = document.layers.item(hwLayerName);
	if (!idLayer.isValid) {
		document.layers.add({
			name:       idLayerName,
			layerColor: UIColors.CYAN,
			visible:    true,
			locked:     false,
			printable:  true
		});
	}
	if (hwLayer.isValid)
		idLayer.move(LocationOptions.BEFORE, hwLayer);
		else idLayer.move(LocationOptions.AT_BEGINNING);
	return idLayer;
}

function pageMargins(page) {
	return {
		top: page.marginPreferences.top,
		left: (page.side === PageSideOptions.LEFT_HAND) ?
			page.marginPreferences.right : page.marginPreferences.left,
		bottom: page.marginPreferences.bottom,
		right: (page.side === PageSideOptions.LEFT_HAND) ?
			page.marginPreferences.left : page.marginPreferences.right
	};
}

/**
 * Simple scrollable alert inspired by this snippet by Peter Kahrel:
 * http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250
 * @param {String|String[]} message - Message to be displayed (string or array)
 * @param {String} title - Dialog title
 * @param {Boolean} [showFilter] - Shows a filtering field; wildcards: '?' (any char), space and '*' (AND), '|' (OR)
 * @param {Boolean} [showCompact] - Sorts message and removes duplicates
 */
function report(message, title, showFilter, showCompact) {
	var search, list;
	var w = new Window('dialog', title);
	// Convert message to array
	if (message.constructor.name !== 'Array') message = message.split(/\r|\n/g);
	if (showCompact && message.length > 1) { // Sort and remove duplicates
		message = message.sort();
		for (var i = 1, l = message[0]; i < message.length; l = message[i], i++) {
			if (l === message[i]) { message.splice(i, 1); i--; }
			if (message[i] === '') { message.splice(i, 1); i--; }
		}
	}
	if (showFilter && message.length > 1) { // Add a filtering field
		search = w.add('edittext { characters: 40, helpTip: "Wildcards: \'?\' (any character), space and \'*\' (AND), \'|\' (OR)" }');
		search.onChanging = function () {
			var str, line, i, n;
			var result = [];
			if (this.text === '') {
				list.text = message.join('\n'); w.text = title; return;
			}
			str = this.text.replace(/[.[\]{+}]/g, '\\$&'); // Pass through '^*()|?'
			str = str.replace(/\?/g, '.'); // '?' -> any character
			if (/[ *]/g.test(str)) str = '(' + str.replace(/ +|\*/g, ').*(') + ')'; // space or '*' -> AND
			str = RegExp(str, 'gi');
			for (i = 0, n = message.length; i < n; i++) {
				line = message[i].toString().replace(/^\s+?/g, '');
				if (str.test(line)) result.push(line.replace(/\r|\n/g, '\u00b6').replace(/\t/g, '\\t'));
			}
			w.text = str + ' | ' + result.length + ' record' + (result.length === 1 ? '' : 's');
			if (result.length > 0) list.text = result.join('\n'); else list.text = '';
		};
	}
	list = w.add('edittext', undefined, message.join('\n'), { multiline: true, scrolling: true, readonly: true });
	list.characters = (function () {
		var width = 50;
		for (var i = 0, n = message.length; i < n; width = Math.max(width, message[i].toString().length), i++);
		return width;
	}());
	list.minimumSize.width  = 600; list.maximumSize.width  = 1024;
	list.minimumSize.height = 100; list.maximumSize.height = 1024;
	w.add('button { text: "Close", properties: { name: "ok" } }');
	w.ok.active = true;
	w.show();
}
