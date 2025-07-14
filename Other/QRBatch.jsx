/*
	Batch QR codes 23.11.25
	(c) 2021-2023 Paul Chiorean <jpeg@basement.ro>

	Adds codes to existing documents or to separate files in batch mode,
	using a 3-column TSV file named 'qr.tsv':

	Filename   | Code   | On doc
	File 1     | Code 1 | +
	File 2_ABC | Code 2 | +
	File 3_AC  | Code 3
	...

	<Filename>: document name;
	<Code>: any string;
	<On doc>: any string: on existing document; empty or missing: on separate file.

	You can use `|` for manually splitting the label into several lines.

	If the document name ends with a separator (space/dot/underline/hyphen) followed by a sequence
	of digits or letters equal to the number of spreads, the letter corresponding to the spread index
	will be appended to each code/file (e.g., for a document with three spreads named `Document_ABC.indd`,
	the script will generate `Document_A_QR.pdf`, `Document_B_QR.pdf` and `Document_C_QR.pdf`.

	The TSV file must be saved locally (in the active document folder); files starting with `_`
	take precedence. Blank lines are ignored; everything after a `#` (comments) is ignored.

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

// @includepath '.;./lib;../lib;../../lib';
// @include 'getBounds.jsxinc';
// @include 'progressBar.jsxinc';
// @include 'report.jsxinc';
// @include 'stat.jsxinc';

var status = [];
var currentPath;
var docHasPath = (function () {
	var ret = false;
	try { ret = !!doc.filePath; } catch (e) {}
	return ret;
}());

if (app.documents.length > 0) {
	doc = app.activeDocument;
	if (doc && docHasPath) currentPath = doc.filePath;
}

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Batch QR codes');

function main() {
	var i, n, ui, item, dataFile, rawData, validLines, queue, progressBar, pbWidth;
	var LIST = {
		width:    1200, // pixels
		height:     24, // lines
		itemHeight: 24  // pixels
	};
	var WIN = (File.fs === 'Windows');
	var invalidFilenameCharsRE = /[<>:"\/\\|?*]/g; // https://gist.github.com/doctaphred/d01d05291546186941e1b7ddc02034d3
	var oldUIL = app.scriptPreferences.userInteractionLevel;
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
	app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
	app.scriptPreferences.enableRedraw = false;

	// User interface
	ui = new Window('dialog', 'Generate QR Codes');
	ui.orientation = 'column';
	ui.alignChildren = [ 'right', 'center' ];
	ui.main = ui.add('group', undefined);
	ui.main.orientation = 'column';
	ui.main.alignChildren = [ 'fill', 'center' ];
	ui.list = ui.main.add('listbox', undefined, undefined, {
		numberOfColumns: 4,
		showHeaders: true,
		columnTitles: [ '#', 'Filename', 'Code', 'Doc' ],
		columnWidths: [ 25, (LIST.width - 72) * 0.7, (LIST.width - 72) * 0.3, 30 ],
		multiselect: true
	});
	ui.list.itemSize[1] = LIST.itemHeight;
	ui.list.size = [ LIST.width, (LIST.itemHeight + 1) * LIST.height + 20 ];
	ui.list.active = true;
	ui.options = ui.add('group', undefined);
	ui.options.orientation = 'row';
	ui.options.alignChildren = [ 'right', 'center' ];
	ui.options.uppercase = ui.options.add('checkbox', undefined, 'Uppercase label');
	ui.options.uppercase.helpTip = 'Make label uppercase';
	ui.options.uppercase.value = true;
	ui.options.white = ui.options.add('checkbox', undefined, 'White label');
	ui.options.white.helpTip = 'Make label white (only when placing on documents)';
	ui.options.white.preferredSize.width = LIST.width - 612;
	ui.options.err = ui.options.add('button', undefined, 'Show errors');
	ui.options.err.visible = false;
	ui.options.div1 = ui.options.add('panel', undefined, undefined);
	ui.options.div1.alignment = 'fill';
	ui.options.div1.visible = false;
	ui.options.reload = ui.options.add('button', undefined, 'Reload');
	ui.options.browse = ui.options.add('button', undefined, 'Browse');
	ui.options.div2 = ui.options.add('panel', undefined, undefined);
	ui.options.div2.alignment = 'fill';
	ui.options.add('button', undefined, 'Cancel', { name: 'cancel' });
	ui.options.start = ui.options.add('button', undefined, 'Start', { name: 'ok' });

	// UI callback functions
	ui.options.reload.onClick = function () {
		var record, fC, ll;
		var line = 0;
		var flgHeader = isEmpty = isComment = isHeader = false;
		dataFile = '';
		rawData = [];
		validLines = [];
		status = [];
		pbWidth = 64;
		ui.list.removeAll();
		if (/QR Codes$/g.test(decodeURI(currentPath))) currentPath = currentPath.parent;
		if (currentPath && (
				((dataFile = File(currentPath + '/_qr.tsv')) && dataFile.exists)
				|| ((dataFile = File(currentPath + '/_QR.tsv')) && dataFile.exists)
				|| ((dataFile = File(currentPath + '/qr.tsv'))  && dataFile.exists)
				|| ((dataFile = File(currentPath + '/QR.tsv'))  && dataFile.exists))
			) {
			dataFile.open('r');
			dataFile.encoding = 'UTF-8';
			while (!dataFile.eof) {
				record = '';
				isEmpty = isComment = isHeader = false;
				record = dataFile.readln(); line++;
				if (record.replace(/^\s+|\s+$/g, '') === '') isEmpty = true;
				else if (record.toString().slice(0,1) === '\u0023') isComment = true;
				record = record.replace(/^\s+|\s+$/g, '');
				record = record.split(/ *\t */);
				if (!flgHeader) if (!isEmpty && !isComment) isHeader = flgHeader = true;
				if (!isEmpty && !isComment && !isHeader) {
					if (record[0]) {
						if ((fC = record[0].match(invalidFilenameCharsRE))) {
							stat(status, 'Line ' + line, 'Forbidden characters in filename: \''
								+ fC.join('\', \'') + '\'.', 1);
						}
						if (!/\.indd$/i.test(record[0])) record[0] += '.indd';
						if (record[2] && !File(currentPath + '/' + record[0]).exists)
							stat(status, 'Line ' + line, "File '" + record[0] + "' not found.", -1);
						if (!record[1]) stat(status, 'Line ' + line, 'Missing code.', -1);
						pbWidth = Math.max(pbWidth, record[0].length);
					} else { stat(status, 'Line ' + line, ': Missing filename.', -1); }
					if (status.length === 0) validLines.push(line);
				}
				rawData.push({
					fn: record[0],
					code: record[1],
					onDoc: record[2],
					valid: (!isEmpty && !isComment && !isHeader),
					exported: false
				});
				// if (!isHeader) {
				if (!isEmpty && !isComment && !isHeader) {
					ll = ui.list.add('item', line);
					ll.subItems[0].text = rawData[line - 1].fn || '';
					ll.subItems[1].text = rawData[line - 1].code || '';
					ll.subItems[2].text = rawData[line - 1].onDoc ? '\u25cf' : ''; // '●'
				}
			}
			dataFile.close();
			record = '';
		}
		ui.list.onChange();
	};
	ui.list.onChange = function () {
		var i, j, m, n;
		if (ui.list.selection) {
			queue = [];
			for (i = 0, n = ui.list.selection.length; i < n; i++) {
				for (j = 0, m = validLines.length; j < m; j++) {
					if (Number(ui.list.selection[i].toString()) === validLines[j]) {
						queue.push(Number(ui.list.selection[i].toString()));
						break;
					}
				}
			}
		} else { queue = validLines; }
		if (queue.length === 0) {
			if (currentPath) {
				ui.text = (dataFile.exists
					? (WIN ? decodeURI(dataFile.fsName) : decodeURI(dataFile.fullName)) + ' \u2013 0 records'
					: 'No data file in ' + decodeURI(currentPath) + '/');
			} else {
				ui.text = 'Select a folder containing the data file';
			}
			if (!currentPath) ui.options.browse.notify();
		} else {
			ui.text = (WIN ? decodeURI(dataFile.fsName) : decodeURI(dataFile.fullName)) + ' \u2013 '
				+ queue.length + ' record' + (queue.length === 1 ? '' : 's')
				+ (status.length > 0 ? ' | ' + status.length + ' error' + (status.length === 1 ? '' : 's') : '');
		}
		ui.options.start.enabled = queue.length > 0 && (status.length === 0 || ui.list.selection);
		ui.options.reload.enabled = !!currentPath;
		ui.options.reload.visible = dataFile.exists;
		ui.options.err.visible = ui.options.div1.visible = (status.length > 0);
		if (status.length > 0) ui.options.err.active = true;
		else if (!dataFile.exists) ui.options.browse.active = true;
		else if (queue.length === 0 && !ui.list.selection) ui.options.reload.active = true;
		else ui.list.active = true;
	};
	ui.list.onDoubleClick = function () { dataFile.execute(); };
	ui.options.err.onClick = function () { report(status, 'Errors', 'auto'); };
	ui.options.browse.onClick = function () {
		var folder = Folder.selectDialog('Select a folder containing the data file:');
		if (folder && folder !== currentPath) {
			if (/QR Codes$/g.test(decodeURI(folder))) folder = folder.parent;
			currentPath = folder;
			ui.options.reload.onClick();
		}
	};
	ui.onShow = function () {
		ui.options.reload.notify();
		ui.frameLocation = [
			(app.activeWindow.bounds[1] + app.activeWindow.bounds[3] - ui.frameSize.width) / 2,
			(app.activeWindow.bounds[0] + app.activeWindow.bounds[2] - ui.frameSize.height) / 2
		];
	};

	// Processing
	if (ui.show() === 2) exit();
	status = [];
	isModified = false;
	progressBar = new ProgressBar('Generating QR Codes', queue.length, pbWidth);
	for (i = 0, n = queue.length; i < n; i++) {
		item = rawData[queue[i] - 1];
		if (item.fn === '' || item.fn.toString().slice(0,1) === '\u0023') { // '#'
			progressBar.update(); progressBar.msg();
			continue;
		}
		if ((item.onDoc && putCodeOnDocument()) || (!item.onDoc && saveCodeOnSeparateFile())) {
			item.exported = true; isModified = true;
		}
	}

	// Update data file
	progressBar.close();
	if (dataFile.exists && isModified && dataFile.open('w')) {
		dataFile.encoding = 'UTF-8';
		dataFile.lineFeed = 'Unix';
		for (i = 0, n = rawData.length; i < n; i++) {
			dataFile.writeln(
				(rawData[i].exported ? '# ' : '')
				+ (rawData[i].fn ? rawData[i].fn : '')
				+ (rawData[i].code ? '\t' + rawData[i].code : '')
				+ (rawData[i].onDoc ? '\t+' : '')
			);
		}
		dataFile.close();
	}
	if (status.length > 0) report(status, 'Errors', 'auto');
	app.scriptPreferences.userInteractionLevel = oldUIL;

	function putCodeOnDocument() {
		var i, p, pp, page, tgBounds, tgSize, labelFrame, codeFrame, qrGroup, labelSize, codeSize, labelText, suffix;
		var target = app.open(File(currentPath + '/' + item.fn));
		if (target.converted) { stat(status, decodeURI(target.name), 'Must be converted; skipped.', -1); return false; }
		var infoLayer = makeInfoLayer(target);
		target.activeLayer = infoLayer;
		suffix = RegExp('[ ._-][a-zA-Z0-9]{' + target.spreads.length + '}$', 'i')
			.exec((/\./g.test(target.name) && target.name.slice(0, target.name.lastIndexOf('.'))) || target.name);
		suffix = suffix == null ? '' : String(suffix);
		progressBar.update();
		progressBar.msg(decodeURI(target.name));
		progressBar.init2(target.spreads.length);
		for (i = 0; i < target.spreads.length; i++) {
			spread = target.spreads[i];
			page = spread.pages[0];
			tgBounds = getBounds(page).spread.visible;
			tgSize = {
				width:  tgBounds[1] - page.bounds[1],
				height: page.bounds[2] - tgBounds[2]
			};

			// Remove old codes
			pp = page.pageItems.everyItem().getElements();
			while ((p = pp.shift())) if (p.label === 'QR') { p.itemLayer.locked = false; p.remove(); }

			// Add label
			if (suffix.length === target.spreads.length + 1)
				labelText = item.code.replace(RegExp(suffix + '$'), '') + suffix[0] + suffix[i + 1];
			else labelText = item.code;
			if (target.spreads.length > 1) {
				progressBar.update2();
				progressBar.msg(decodeURI(target.name) + ' \u2022 ' + (i + 1));
			}
			labelFrame = page.textFrames.add({
				label: 'QR',
				itemLayer: infoLayer.name,
				fillColor:   'Paper',
				strokeColor: 'None',
				bottomLeftCornerOption:  CornerOptions.NONE,
				bottomRightCornerOption: CornerOptions.NONE,
				topLeftCornerOption:     CornerOptions.NONE,
				topRightCornerOption:    CornerOptions.NONE,
				contents: /\|/g.test(labelText)          // If '|' found
					? labelText.replace(/\|/g, '\u000A') // replace it with Forced Line Break
					: balanceText(labelText, 20)         // else auto balance text
			});
			labelFrame.paragraphs.everyItem().properties = {
				appliedFont: app.fonts.item('Helvetica Neue\tRegular'),
				pointSize: '5 pt',
				autoLeading: 100,
				leading: Leading.AUTO,
				justification: Justification.LEFT_ALIGN,
				horizontalScale: 92,
				tracking: -15,
				hyphenation: false,
				capitalization: ui.options.uppercase.value ? Capitalization.ALL_CAPS : Capitalization.NORMAL,
				fillColor:   ui.options.white.value ? 'Paper' : 'Black',
				strokeColor: ui.options.white.value ? 'Black' : 'Paper',
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
					UnitValue('4.0 mm').as('pt'), // T
					UnitValue('3.0 mm').as('pt'), // L
					UnitValue('1.0 mm').as('pt'), // B
					UnitValue('3.0 mm').as('pt')  // R
				]
			};
			target.align(labelFrame, AlignOptions.LEFT_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
			target.align(labelFrame, AlignOptions.TOP_EDGES,  AlignDistributeBounds.PAGE_BOUNDS);

			// Add code
			codeFrame = page.rectangles.add({
				label: 'QR',
				itemLayer: infoLayer.name,
				fillColor:   'Paper',
				strokeColor: 'None',
				bottomLeftCornerOption:  CornerOptions.NONE,
				bottomRightCornerOption: CornerOptions.NONE,
				topLeftCornerOption:     CornerOptions.NONE,
				topRightCornerOption:    CornerOptions.NONE
			});
			codeFrame.absoluteRotationAngle = -90;
			codeFrame.geometricBounds = [
				labelFrame.geometricBounds[2],
				page.bounds[1] + UnitValue('3 mm').as('pt'),
				labelFrame.geometricBounds[2] + UnitValue('12 mm').as('pt'),
				page.bounds[1] + UnitValue('15 mm').as('pt')
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
			codeFrame.sendToBack(labelFrame);
			qrGroup = page.groups.add([ labelFrame, codeFrame ]);
			qrGroup.absoluteRotationAngle = 90;
			// Try to put code outside visible area
			labelSize = {
				width:  labelFrame.geometricBounds[3] - labelFrame.geometricBounds[1],
				height: labelFrame.geometricBounds[2] - labelFrame.geometricBounds[0]
			};
			codeSize = codeFrame.geometricBounds[3] - codeFrame.geometricBounds[1];
			target.align(qrGroup, AlignOptions.LEFT_EDGES,   AlignDistributeBounds.PAGE_BOUNDS);
			target.align(qrGroup, AlignOptions.BOTTOM_EDGES, AlignDistributeBounds.PAGE_BOUNDS);
			if ((labelSize.width > tgSize.width && labelSize.height > tgSize.height)
				|| ((labelSize.width + codeSize) > tgSize.width
				&& (codeSize + UnitValue('2.3 mm').as('pt')) > tgSize.height))
				qrGroup.move(undefined, [ tgSize.width, -tgSize.height ]);
			qrGroup.ungroup();
		}
		target.save(/* File(currentPath + "/" + item.fn) */);
		target.close();
		return true;
	}

	function saveCodeOnSeparateFile() {
		var i, labelText, baseName, targetName, suffix;
		var ret = true;
		baseName = (/\./g.test(item.fn) && item.fn.slice(0, item.fn.lastIndexOf('.'))) || item.fn;
		baseName = baseName.replace(/_QR$/i, '');
		suffix = /[ ._-][a-zA-Z0-9]{1,3}$/i.exec(baseName);
		suffix = suffix[0] || '';
		progressBar.update();
		progressBar.msg(baseName + '_QR.pdf');
		if (suffix.length > 2) progressBar.init2(suffix.length - 1);
		if (suffix.length > 1) {
			for (i = 0; i < suffix.length - 1; i++) {
				targetName = baseName.replace(RegExp(suffix + '$'), '') + suffix[0] + suffix[i + 1];
				labelText = item.code.replace(RegExp(suffix + '$'), '') + suffix[0] + suffix[i + 1];
				if (suffix.length > 2) {
					progressBar.update2();
					progressBar.msg(targetName + '_QR.pdf');
				}
				if (!makeQRFile()) ret = false;
			}
		} else {
			targetName = baseName;
			labelText = item.code;
			ret = makeQRFile();
		}
		return ret;

		function makeQRFile() {
			var labelFrame, codeFrame, qrGroup, targetFolder, ancillaryFile, pdfFile;
			var target = app.documents.add();
			var page = target.pages[0];
			var infoLayer = makeInfoLayer(target);

			// Add label
			labelFrame = page.textFrames.add({
				label: 'QR',
				itemLayer: infoLayer.name,
				fillColor:   'None',
				strokeColor: 'None',
				bottomLeftCornerOption:  CornerOptions.NONE,
				bottomRightCornerOption: CornerOptions.NONE,
				topLeftCornerOption:     CornerOptions.NONE,
				topRightCornerOption:    CornerOptions.NONE,
				contents: /\|/g.test(labelText)          // If '|' found
					? labelText.replace(/\|/g, '\u000A') // replace it with Forced Line Break
					: balanceText(labelText, 18)         // else auto balance text
			});
			labelFrame.paragraphs.everyItem().properties = {
				appliedFont: app.fonts.item('Helvetica Neue\tRegular'),
				pointSize: '5 pt',
				autoLeading: 100,
				leading: Leading.AUTO,
				justification: Justification.LEFT_ALIGN,
				horizontalScale: 92,
				tracking: -15,
				capitalization: ui.options.uppercase.value ? Capitalization.ALL_CAPS : Capitalization.NORMAL,
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
			codeFrame = page.rectangles.add({
				label: 'QR',
				itemLayer: infoLayer.name,
				fillColor:   'None',
				strokeColor: 'None',
				bottomLeftCornerOption:  CornerOptions.NONE,
				bottomRightCornerOption: CornerOptions.NONE,
				topLeftCornerOption:     CornerOptions.NONE,
				topRightCornerOption:    CornerOptions.NONE
			});
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
			codeFrame.sendToBack(labelFrame);
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
				stat(status, ancillaryFile.name, 'Text overflows.', 1);
				return false;
			}
			setPDFExportPreferences();
			target.exportFile(ExportFormat.pdfType, File(pdfFile), false);
			target.close(SaveOptions.NO);
			return true;
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

		// 1st pass: break text into words and roughly join them into lines
		var wordRE = /((.+?)([ _+\-\u2013\u2014]|[a-z]{2}(?=[A-Z]{1}[a-z])|[a-z]{2}(?=[0-9]{3})|(?=[([])))|(.+)/g;
		words = txt.match(wordRE);
		while ((word = words.shift())) {
			if ((lineBuffer + word).length <= length) {
				lineBuffer += word;
			} else {
				if (lineBuffer !== '') lines.push(lineBuffer);
				lineBuffer = word;
			}
		}
		if (lineBuffer !== '') lines.push(lineBuffer);

		// 2nd pass: balance ragged lines
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

	function makeInfoLayer(document) {
		var infoLayerName = 'info';
		var infoLayer = document.layers.item(infoLayerName);
		if (!infoLayer.isValid) {
			document.layers.add({
				name: infoLayerName,
				layerColor: UIColors.CYAN,
				visible: true,
				locked: false,
				printable: true
			});
		}
		infoLayer.move(LocationOptions.AT_BEGINNING);
		return infoLayer;
	}
}
