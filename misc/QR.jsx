/*
	QR code 22.1.27
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

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

// @include '../lib/GetBounds.jsxinc';
// @include '../lib/ProgressBar.jsxinc';
// @include '../lib/Report.jsxinc';

doc = (app.documents.length === 0) ? app.documents.add() : app.activeDocument;
var currentPath = doc.saved ? doc.filePath : '';

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined,
	UndoModes.ENTIRE_SCRIPT, 'QR code');

function main() {
	var baseName, suffix, ui, codeText, onDoc;
	var errors = [];
	baseName = /\./g.test(doc.name) ? doc.name.slice(0, doc.name.lastIndexOf('.')) : doc.name;
	// baseName = baseName.replace(/_QR$/i, '');
	suffix = RegExp('[ ._-][a-zA-Z0-9]{' + doc.spreads.length + '}$', 'i').exec(baseName);
	suffix = suffix[0] || '';
	app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
	app.scriptPreferences.enableRedraw = false;

	// User interface
	ui = new Window('dialog { alignChildren: [ "left", "fill" ], orientation: "row", text: "Generate QR Code" }');
	ui.qpanel = ui.add('panel { alignChildren: [ "left", "top" ], orientation: "column" }');
	ui.qpanel.add('statictext { properties: { name: "st" }, text: "Enter QR code text:" }');
		ui.label = ui.qpanel.add('edittext { active: true, characters: 56, helpTip: "Use \'|\' for manual line breaks", properties: { enterKeySignalsOnChange: true } }');
		ui.options = ui.qpanel.add('group { margins: [ 0, 5, 0, 0 ], orientation: "row", spacing: 15 }');
			ui.white = ui.options.add('checkbox { helpTip: "Make label white (only when placing on documents)", text: "White label" }');
			ui.uppercase = ui.options.add('checkbox { helpTip: "Make label uppercase", text: "Uppercase label" }');
			ui.uppercase.value = true;
	ui.actions = ui.add('group { alignChildren: [ "fill", "top" ], orientation: "column" }');
		ui.ondoc = ui.actions.add('button { helpTip: "Place the code on the bottom-left corner of each page", text: "On doc", properties: { name: "ok" } }');
		ui.onfile = ui.actions.add('button { text: "Separate" }');
		ui.onfile.helpTip = currentPath ? 'QR Codes/' +
			((/\./g.test(doc.name) && doc.name.slice(0, doc.name.lastIndexOf('.'))) || doc.name) + '_QR.pdf' :
			'Where? Document is not saved';
		ui.actions.add('button { text: "Cancel", properties: { name: "cancel" } }');
		ui.onfile.enabled = !!currentPath;
		ui.ondoc.onClick  = function () { onDoc = true; ui.close(); };
		ui.onfile.onClick = function () { onDoc = false; ui.close(); };
	if (ui.show() === 2) exit();

	// Processing
	codeText = ui.label.text.replace(/^\s+|\s+$/g, '');
	if (!codeText) { main(); exit(); }
	if (onDoc) putCodeOnDocument(); else saveCodeOnSeparateFile();
	if (errors.length > 0) report(errors, 'Errors');

	function putCodeOnDocument() {
		var i, p, pp, page, spread, tgBounds, tgSize, labelFrame, codeFrame, qrGroup, labelSize, codeSize, labelText;
		var idLayer = makeIDLayer(doc);
		doc.activeLayer = idLayer;
		for (i = 0; i < doc.spreads.length; i++) {
			spread = doc.spreads[i];
			page = spread.pages[0];
			tgBounds = getBounds(page).spread.visible || getBounds(page).spread.size;
			tgSize = {
				width: tgBounds[1] - page.bounds[1],
				height: page.bounds[2] - tgBounds[2]
			};
			// Remove old codes
			pp = page.pageItems.everyItem().getElements();
			while ((p = pp.shift())) if (p.label === 'QR') { p.itemLayer.locked = false; p.remove(); }
			// Add label
			if (suffix.length === doc.spreads.length + 1)
				labelText = codeText.replace(suffix, '') + suffix[0] + suffix[i + 1];
			else labelText = codeText;
			labelFrame = page.textFrames.add({
				label: 'QR',
				itemLayer: idLayer.name,
				fillColor: 'None',
				strokeColor: 'None',
				contents: /\|/g.test(labelText) ?        // If '|' found
					labelText.replace(/\|/g, '\u000A') : // replace it with Forced Line Break
					balanceText(labelText, 18)           // else auto balance text
			});
			labelFrame.paragraphs.everyItem().properties = {
				appliedFont: app.fonts.item('Helvetica Neue\tRegular'),
				pointSize: '5 pt',
				autoLeading: 100,
				horizontalScale: 92,
				tracking: -15,
				hyphenation: false,
				capitalization: ui.uppercase.value ? Capitalization.ALL_CAPS : Capitalization.NORMAL,
				fillColor: ui.white.value ? 'Paper' : 'Black',
				strokeColor: ui.white.value ? 'Black' : 'Paper',
				strokeWeight: '0.4 pt',
				endJoin: EndJoin.ROUND_END_JOIN
			};
			labelFrame.textFramePreferences.properties = {
				verticalJustification: VerticalJustification.BOTTOM_ALIGN,
				firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
				autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
				autoSizingType: AutoSizingTypeEnum.HEIGHT_AND_WIDTH,
				useNoLineBreaksForAutoSizing: true,
				insetSpacing: [
					UnitValue('3.0 mm').as('pt'),
					UnitValue('2.5 mm').as('pt'),
					UnitValue('1.0 mm').as('pt'),
					UnitValue('2.5 mm').as('pt')
				]
			};
			doc.align(labelFrame, AlignOptions.LEFT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
			doc.align(labelFrame, AlignOptions.TOP_EDGES,  AlignDistributeBounds.PAGE_BOUNDS);
			// Add code
			codeFrame = page.rectangles.add({
				itemLayer: idLayer.name,
				label: 'QR',
				fillColor: 'Paper',
				strokeColor: 'None'
			});
			codeFrame.absoluteRotationAngle = -90;
			codeFrame.geometricBounds = [
				labelFrame.geometricBounds[2],
				page.bounds[1] + UnitValue('2.3 mm').as('pt'),
				labelFrame.geometricBounds[2] + UnitValue('11.8 mm').as('pt'),
				page.bounds[1] + UnitValue('14.1 mm').as('pt')
			];
			codeFrame.createPlainTextQRCode(labelText.replace(/[|\u000A]/g, '')); // Remove LB markers
			codeFrame.frameFittingOptions.properties = {
				fittingAlignment: AnchorPoint.CENTER_ANCHOR,
				fittingOnEmptyFrame: EmptyFrameFittingOptions.PROPORTIONALLY,
				topCrop:    UnitValue('2.7 mm').as('pt'),
				leftCrop:   UnitValue('2.7 mm').as('pt'),
				bottomCrop: UnitValue('2.7 mm').as('pt'),
				rightCrop:  UnitValue('2.7 mm').as('pt')
			};
			codeFrame.epss[0].localDisplaySetting = DisplaySettingOptions.HIGH_QUALITY;
			// Reposition
			qrGroup = page.groups.add([ labelFrame, codeFrame ]);
			qrGroup.absoluteRotationAngle = 90;
			// Try to put code outside visible area
			labelSize = {
				width:  labelFrame.geometricBounds[3] - labelFrame.geometricBounds[1],
				height: labelFrame.geometricBounds[2] - labelFrame.geometricBounds[0]
			};
			codeSize = codeFrame.geometricBounds[3] - codeFrame.geometricBounds[1];
			doc.align(qrGroup, AlignOptions.LEFT_EDGES,   AlignDistributeBounds.PAGE_BOUNDS);
			doc.align(qrGroup, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
			if ((labelSize.width > tgSize.width && labelSize.height > tgSize.height) ||
					((labelSize.width + codeSize) > tgSize.width &&
					(codeSize + UnitValue('2.3 mm').as('pt')) > tgSize.height))
				qrGroup.move(undefined, [ tgSize.width, -tgSize.height ]);
			qrGroup.ungroup();
		}
	}

	function saveCodeOnSeparateFile() {
		var i, targetName, labelText, progressBar;
		if (suffix.length === doc.spreads.length + 1) {
			progressBar = new ProgressBar('Saving', doc.spreads.length);
			for (i = 0; i < doc.spreads.length; i++) {
				targetName = baseName.replace(RegExp(suffix + '$'), '') + suffix[0] + suffix[i + 1];
				labelText = codeText.replace(RegExp(suffix + '$'), '') + suffix[0] + suffix[i + 1];
				progressBar.update(i + 1);
				makeQRFile();
			}
			progressBar.close();
		} else {
			targetName = baseName;
			labelText = codeText;
			makeQRFile();
		}

		function makeQRFile() {
			var labelFrame, codeFrame, qrGroup, targetFolder, ancillaryFile, pdfFile;
			var target = app.documents.add();
			var page = target.pages[0];
			var idLayer = makeIDLayer(target);
			// Add label
			labelFrame = page.textFrames.add({
				label: 'QR',
				itemLayer: idLayer.name,
				fillColor: 'None',
				strokeColor: 'None',
				contents: /\|/g.test(labelText) ?        // If '|' found
					labelText.replace(/\|/g, '\u000A') : // replace it with Forced Line Break
					balanceText(labelText, 18)           // else auto balance text
			});
			labelFrame.paragraphs.everyItem().properties = {
				appliedFont: app.fonts.item('Helvetica Neue\tRegular'),
				pointSize: '5 pt',
				autoLeading: 100,
				horizontalScale: 92,
				tracking: -15,
				capitalization: ui.uppercase.value ? Capitalization.ALL_CAPS : Capitalization.NORMAL,
				hyphenation: false,
				fillColor: 'Black'
			};
			labelFrame.geometricBounds = [
				0,
				0,
				UnitValue('5.787 mm').as('pt'),
				UnitValue('20 mm').as('pt')
			];
			labelFrame.textFramePreferences.properties = {
				verticalJustification: VerticalJustification.BOTTOM_ALIGN,
				firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
				autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
				autoSizingType: AutoSizingTypeEnum.HEIGHT_ONLY,
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
			codeFrame.createPlainTextQRCode(labelText.replace(/[|\u000A]/g, '')); // Remove LB markers
			codeFrame.frameFittingOptions.properties = {
				fittingAlignment: AnchorPoint.CENTER_ANCHOR,
				fittingOnEmptyFrame: EmptyFrameFittingOptions.PROPORTIONALLY,
				topCrop:    UnitValue('1.533 mm').as('pt'),
				leftCrop:   UnitValue('1.640 mm').as('pt'),
				bottomCrop: UnitValue('1.533 mm').as('pt'),
				rightCrop:  UnitValue('1.640 mm').as('pt')
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
			target.documentPreferences.documentBleedTopOffset = UnitValue('3 mm').as('pt');
			// Export PDF
			targetFolder = Folder(currentPath + '/QR Codes');
			targetFolder.create();
			targetName += '_QR';
			ancillaryFile = File(targetFolder + '/' + targetName + '.indd');
			if (ancillaryFile.exists) ancillaryFile.remove();
			pdfFile = File(targetFolder + '/' + targetName + '.pdf');
			if (pdfFile.exists) pdfFile.remove();
			if (labelFrame.overflows) {
				// If text overflows keep file opened
				target.textPreferences.showInvisibles = true;
				target.save(ancillaryFile);
				errors.push(ancillaryFile.name + ': Text overflows.');
			}
			setPDFExportPreferences();
			target.exportFile(ExportFormat.pdfType, File(pdfFile), false);
			target.close(SaveOptions.NO);
		}

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
			var i, delta, line, w, newLine1, newLine2;
			for (i = 0; i < lines.length - 1; i++) {
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
				name: idLayerName,
				layerColor: UIColors.CYAN,
				visible: true,
				locked: false,
				printable: true
			});
		}
		if (hwLayer.isValid)
			idLayer.move(LocationOptions.BEFORE, hwLayer);
			else idLayer.move(LocationOptions.AT_BEGINNING);
		return idLayer;
	}
}
