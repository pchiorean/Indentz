/*
	Quick export 25.3.2
	(c) 2021-2025 Paul Chiorean <jpeg@basement.ro>

	Exports open .indd documents or a folder with several configurable PDF presets.

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

/* eslint-disable max-depth */

// @includepath '.;./lib;../lib;../../lib';
// @include 'getFilesRecursively.jsxinc';
// @include 'isInArray.jsxinc';
// @include 'naturalSorter.jsxinc';
// @include 'progressBar.jsxinc';
// @include 'report.jsxinc';
// @include 'stat.jsxinc';
// @include 'unique.jsxinc';

app.doScript(QuickExport, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'QuickExport');

function QuickExport() {
	var doc, settings, settingsFile, ui, progressBar;
	var status = [];
	var title = 'Quick Export';
	var WIN = (File.fs === 'Windows');
	var invalidFilenameCharsRE = /[<>:"\/\\|?*]/g; // https://gist.github.com/doctaphred/d01d05291546186941e1b7ddc02034d3
	var invalidFilenameCharsRElaxed = /[<>:"\\|?*]/g;
	var regexTokensRE = /[|^$(.)[\]{*+?}\\]/g;
	var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());
	var old = {
		measurementUnit: app.scriptPreferences.measurementUnit,
		userInteractionLevel: app.scriptPreferences.userInteractionLevel,
		viewPDF: app.pdfExportPreferences.viewPDF
	};
	var isFolderMode = (app.documents.length === 0);
	var time = {
		MMDD: zeroPad((new Date()).getMonth() + 1, 2) + '.' + zeroPad((new Date()).getDate(), 2),
		stopwatchStart: function () { swStart = new Date().getTime(); },
		stopwatchElapsed: function () {
			swElapsed = new Date().getTime() - swStart;
			swStart = new Date().getTime();
			return (swElapsed / 1000);
		},
		secondsToHMS: function (sec) {
			var hours = Math.floor(sec / 3600);
			var minutes = Math.floor((sec % 3600) / 60);
			var seconds = sec % 60;
			return ((hours > 0 ? hours + 'h ' : '')
				+ (minutes > 0 ? minutes + 'm ' : '')
				+ (seconds > 0 ? seconds.toFixed(1).replace(/\.0$/, '') + 's ' : ''))
					.replace(/\s*$/, '');
		},
		elapsed: 0
	};

	var VER = '5.0';
	var defaults = {
		workflow1: {
			active: true,
			label: 'For approval',
			presetName: '_LowRes',
			presetOptions: {
				cropMarks: true,
				pageInfo: true,
				slugArea: true,
				asSpreads: true,
				customDPI: { active: false, value: '' },
				customBleed: { active: false, value: '' },
				exportLayers: false
			},
			docActions: {
				updateLinks: true,
				skipDNP: false,
				script: { active: false, value: '' }
			},
			outputOptions: {
				destination: { active: false, value: '' },
				prefix: { active: true, value: '' },
				suffix: { active: true, value: '' },
				sortInSubfolders: { active: true, value: '' },
				sortByDate: { active: true, value: '' },
				split: false,
				overwrite: false,
				docSave: { active: true, saveAs: false }
			}
		},
		workflow2: {
			active: false,
			label: 'Final',
			presetName: '_HighRes',
			presetOptions: {
				cropMarks: true,
				pageInfo: true,
				slugArea: true,
				asSpreads: true,
				customDPI: { active: false, value: '' },
				customBleed: { active: false, value: '' },
				exportLayers: false
			},
			docActions: {
				updateLinks: true,
				skipDNP: false,
				script: { active: false, value: '' }
			},
			outputOptions: {
				destination: { active: false, value: '' },
				prefix: { active: true, value: '' },
				suffix: { active: true, value: '' },
				sortInSubfolders: { active: true, value: '' },
				sortByDate: { active: true, value: '' },
				split: false,
				overwrite: false,
				docSave: { active: true, saveAs: false }
			}
		},
		updateVersion: false,
		docClose: true,
		dnpLayers: 'covered area*'
			+ '\nfold,falz'
			+ '\nguides,grid,masuratori'
			+ '\nsafe*area,safe*margins'
			+ '\nsegmentation'
			+ '\nvi?ible area,rahmen,sicht*',
		position: '',
		version: VER
	};

	// Resolve settings location: if user data folder is not detected (OneDrive?), fallback to script location
	if (Folder.userData) {
		if (!Folder(Folder.userData + '/.indentz/').exists) Folder(Folder.userData + '/.indentz/').create();
		settingsFile = File(Folder.userData + '/.indentz/' + getFileName(script.name) + '.prefs');
	} else {
		settingsFile = File(getFileName(script.fullName) + '.prefs');
	}

	// Main
	app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALERTS;
	app.pdfExportPreferences.viewPDF = false;

	if (showDialog() === 1) {
		time.stopwatchStart();
		main();
		cleanup();

		// Show report
		time.elapsed = time.stopwatchElapsed();
		if (status.length > 0) {
			report(status,
				'Finished in ' + time.secondsToHMS(time.elapsed)
					+ (status.length > 0
						? (' | ' + status.length + ' warning' + (status.length === 1 ? '' : 's'))
						: ''
					),
				'auto', false);
		} else if (time.elapsed >= 10) { alert('Finished in ' + time.secondsToHMS(time.elapsed) + '.'); }
	} else {
		cleanup();
	}
	exit();

	function main() {
		var name, maxCounter, exp, prefix, suffix, layer, baseFolder, destFolder, subFolder;
		var names = [];
		var docs = [];
		var layersState = [];
		var pbWidth = 50;

		app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

		// Get documents list
		if (isFolderMode) {
			docs = getFilesRecursively(Folder(ui.input.source.path), ui.input.options.includeSubfolders.value, 'indd')
				.sort(naturalSorter);
			if (docs.length === 0) { alert('No InDesign documents found.'); cleanup(); exit(); }
		} else {
			docs = app.documents.everyItem().getElements();
			while ((doc = docs.shift())) try { names.push(doc.fullName); } catch (e) { names.push(doc.name); }
			names.sort(naturalSorter);
			docs = [];
			while ((name = names.shift())) docs.push(app.documents.itemByName(name));
		}

		// Init progress bar
		maxCounter = docs.length * ((ui.workflow1.isOn.value ? 1 : 0) + (ui.workflow2.isOn.value ? 1 : 0));
		for (i = 0; i < docs.length; i++) pbWidth = Math.max(pbWidth, decodeURI(docs[i].name).length);
		progressBar = new ProgressBar('Exporting', maxCounter, pbWidth + 10);

		// Documents loop
		while ((doc = docs.shift())) {
			// Open document (optionally upgrade from old versions)
			if (isFolderMode) {
				if (doc.exists) {
					doc = app.open(doc);
				} else {
					stat(status, decodeURI(doc), 'Not found; skipped.', -1);
					continue;
				}
				if (doc.converted) {
					if (ui.actions.updateVersion.value) {
						doc.save(File(doc.filePath + '/' + doc.name));
						stat(status, decodeURI(doc.name), 'Converted from old version.', 0);
					} else {
						stat(status, decodeURI(doc.name), 'Must be converted; skipped.', -1);
						doc.close(SaveOptions.NO);
						continue;
					}
				}
			} else {
				app.activeDocument = doc;
				if (doc.converted) {
					if (ui.actions.updateVersion.value) {
						doc.save(File(doc.filePath + '/' + doc.name));
						stat(status, decodeURI(doc.name), 'Converted from old version.', 0);
					} else {
						stat(status, decodeURI(doc.name), 'Must be converted; skipped.', -1);
						continue;
					}
				}
				if (!doc.saved) {
					stat(status, decodeURI(doc.name), 'Is not saved; skipped.', -1);
					continue;
				}
			}

			// Set measurement units
			old.horizontalMeasurementUnits = doc.viewPreferences.horizontalMeasurementUnits;
			old.verticalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits;
			doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
			doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;

			// Global checks
			checkTextOverflow(); // Text overflows are allowed, but reported
			if (!checkFonts()) { // Check fonts; skip if missing
				stat(status, decodeURI(doc.name), 'Missing fonts; skipped.', -1);
				continue;
			}

			// Workflows loop
			old.docSpreads = doc.spreads.length; // Save initial spreads count for 'asPairs' (see 'exportDoc()')
			for (var step = 1; step < 3; step++) {
				exp = ui['workflow' + step]; // `exp` = the current workflow
				if (!exp.isOn.value) continue;

				saveLayersState();

				// Update links; skip if missing
				if (exp.updateLinks.value && !updateLinks()) {
					stat(status, decodeURI(doc.name), 'Missing links; skipped.', -1);
					continue;
				}

				// Get base folder
				baseFolder = decodeURI(doc.filePath);
				if (exp.destination.isOn.value) baseFolder = beautifyPath(Folder(exp.destination.path));

				// Get initial prefix/suffix
				prefix = exp.prefix.et.text ? exp.prefix.et.text : '';
				suffix = exp.suffix.et.text ? ('_' + exp.suffix.et.text) : '';

				// Create subfolders
				destFolder = baseFolder;
				subFolder = '';
				if (exp.sortInSubfolders.isOn.value && exp.sortInSubfolders.et.text.length > 0) {
					subFolder = exp.sortInSubfolders.et.text.replace(/^_/, '')
						.replace(/\+.*$/, '')
						.replace(/^\s+|\s+$/g, '');
					destFolder = baseFolder + '/' + subFolder;
					if (!Folder(destFolder).exists) Folder(destFolder).create();
				}
				if (exp.sortByDate.isOn.value && exp.sortByDate.et.text.length > 0) {
					if (!Folder(destFolder + '/' + exp.sortByDate.et.text).exists)
						Folder(destFolder + '/' + exp.sortByDate.et.text).create();
				}

				// Reset prefix/suffix if not needed
				if (!exp.prefix.isOn.value) prefix = '';
				if (!exp.suffix.isOn.value) suffix = '';

				// Run a script
				if (exp.script.isOn.value) {
					runScript(File(exp.script.path));
					app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
					app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
				}

				// Hide do-not-print layers
				if (exp.skipDNP.isOn.value) {
					for (i = 0; i < doc.layers.length; i++) {
						if (/^[.-]/.test(doc.layers[i].name)
								|| isInArray(doc.layers[i].name, settings.dnpLayers.split(/[,\r|\n]/g)))
							doc.layers[i].visible = false;
					}
				}

				// Append to the suffix all visible & printable layers named '+xxxxxxx'
				if (exp.suffix.isOn.value && /^_(print|High ?Res)/i.test(suffix)) {
					// Hack: Dielines layer has priority
					if (((layer = doc.layers.itemByName('dielines')).isValid
						|| (layer = doc.layers.itemByName('diecut')).isValid
						|| (layer = doc.layers.itemByName('die cut')).isValid)
						&& layer.visible
						&& (layer.allPageItems.length > 0)
						&& layer.printable
					) suffix += '+dielines';

					for (i = 0; i < doc.layers.length; i++) {
						layer = doc.layers[i];
						if (!layer.visible || !layer.printable) continue;
						if (/^(dielines|die ?cut)$/g.test(layer.name)) continue;
						if (/^\+/g.test(layer.name) && (layer.allPageItems.length > 0)) suffix += layer.name;
					}
				}

				doExport(exp.asSpreads.value, exp.split.value, exp.preset.selection.text);

				restoreLayersState();

				// Restore measurement units
				doc.viewPreferences.horizontalMeasurementUnits = old.horizontalMeasurementUnits;
				doc.viewPreferences.verticalMeasurementUnits = old.verticalMeasurementUnits;

				// Update document
				if (exp.docSave.value) {
					app.activeWindow.activePage = doc.spreads[0].pages[0];
					app.activeWindow.zoom(ZoomOptions.FIT_SPREAD);

					if (exp.saveAs.enabled && exp.saveAs.value) doc.save(File(doc.fullName));
					else if (doc.modified) doc.save();
				}
			}

			// Close document
			if (isFolderMode) doc.close(SaveOptions.NO);
			else if (ui.actions.docClose.value) doc.close(SaveOptions.NO);
		}

		function checkFonts() {
			var result = true;
			var usedFonts = doc.fonts.everyItem().getElements();
			for (var i = 0, n = usedFonts.length; i < n; i++) {
				if (usedFonts[i].status !== FontStatus.INSTALLED) {
					result = false;
					stat(status, decodeURI(doc.name),
					"Font '" + usedFonts[i].name.replace(/\t/g, ' ')
						+ "' is "
						+ String(usedFonts[i].status).toLowerCase().replace(/_/g, ' ')
						+ '.'
					, 1);
				}
			}
			return result;
		}

		function checkTextOverflow() {
			var result = true;
			var frm;
			var frms = doc.allPageItems;
			while ((frm = frms.shift())) {
				if (frm.constructor.name !== 'TextFrame') continue;
				if (frm.overflows && frm.parentPage) {
					result = false;
					stat(status, decodeURI(doc.name),
					'Text overflows on page '
						+ frm.parentPage.name
						+ ': \''
						+ frm.contents.substr(0, 32).replace(/\r|\n/g, '\u00B6') + '...'
						+ '\''
					, 1);
				}
			}
			return result;
		}

		function updateLinks() {
			var hasParentPage;
			var result = true;
			for (var i = 0, n = doc.links.length; i < n; i++) {
				hasParentPage = (function (lnk) {
					var ret = false;
					try { ret = !!lnk.parent.parentPage.toSource(); } catch (e) {}
					return ret;
				}(doc.links[i]));
				if (!hasParentPage) continue;
				switch (doc.links[i].status) {
					case LinkStatus.LINK_OUT_OF_DATE:
						doc.links[i].update();
						break;
					case LinkStatus.LINK_MISSING:
					case LinkStatus.LINK_INACCESSIBLE:
						result = false;
						stat(status, decodeURI(doc.name),
						"Link '"
							+ doc.links[i].name
							+ "' not found on page "
							+ doc.links[i].parent.parentPage.name
							+ '.'
						, 1);
				}
			}
			return result;
		}

		function runScript(/*File*/scriptPath) {
			try {
				app.doScript(scriptPath,
					getScriptLanguage(scriptPath.fsName.replace(/^.*\./, '')),
					undefined,
					UndoModes.ENTIRE_SCRIPT, 'Run script'
				);
			} catch (e) {
				stat(status, decodeURI(doc.name),
				'Script returned "'
					+ e.toString().replace(/\r|\n/g, '\u00B6')
					+ '" (line: '
					+ e.line + ').'
				, -1);
			}

			function getScriptLanguage(/*string*/ext) {
				return {
					scpt:   WIN ? undefined : ScriptLanguage.APPLESCRIPT_LANGUAGE,
					js:     ScriptLanguage.JAVASCRIPT,
					jsx:    ScriptLanguage.JAVASCRIPT,
					jsxbin: ScriptLanguage.JAVASCRIPT
				}[ext];
			}
		}

		function saveLayersState() {
			var i, l;
			for (i = 0; i < doc.layers.length; i++) {
				l = doc.layers[i];
				layersState.push({
					layer:     l.name,
					locked:    l.locked,
					printable: l.printable,
					visible:   l.visible
				});
				if (l.locked) l.locked = false;
			}
		}

		function restoreLayersState() {
			var i, l;
			for (i = 0; i < layersState.length; i++) {
				l = doc.layers.itemByName(layersState[i].layer);
				if (l.isValid) {
					l.locked    = layersState[i].locked;
					l.printable = layersState[i].printable;
					l.visible   = layersState[i].visible;
				}
			}
			layersState = [];
		}

		function doExport(/*bool*/asSpreads, /*bool*/split, /*string*/preset) {
			var fileSufx, destination, asPairs, range;
			var scope = asSpreads ? doc.spreads : doc.pages;
			var isCombo = /[_-]\s*\d+([.,]\d+)?\s*([cm]m)?\s*x\s*\d+([.,]\d+)?\s*([cm]m)?\s*\+\s*\d+([.,]\d+)?\s*([cm]m)?\s*x\s*\d+([.,]\d+)?\s*([cm]m)?\s*(?!x)\s*(?!\d)/ig.test(decodeURI(doc.name));
			var baseName = decodeURI(doc.name).replace(/\.indd$/i, '');

			if (split && !isCombo) { // Export separate pages or spreads
				// If the document name ends with a separator (space/dot/underline/hyphen)
				// followed by a sequence of letters equal to the number of spreads, each
				// exported spread will have the letter corresponding to its index appended
				// to the name: `Doc_ABC` -> 'Doc_A, Doc_B, Doc_C.
				// Note: If a script doubles the number of spreads, we'll split by pairs
				asPairs = (doc.spreads.length === old.docSpreads * 2) && asSpreads;
				fileSufx = RegExp('([ ._-])([a-zA-Z]{'
					+ (asPairs ? scope.length / 2 : scope.length)
					+ '})$', 'i').exec(baseName);
				progressBar.update();
				progressBar.init2(scope.length);

				for (var i = 0, n = scope.length; i < n; i++) {
					// Add a page/spread index
					destination = baseName;
					if (fileSufx) { // It has an `_ABC` index
						destination = destination.replace(RegExp(fileSufx[0] + '$'), '')
							+ fileSufx[1]
							+ fileSufx[2][asPairs && !(i % 2) ? i / 2 : i];
					} else if (scope.length > 1) { // Add numeric index
						destination += '_' + zeroPad(asPairs && !(i % 2) ? i / 2 + 1 : i + 1, String(n).length);
					}

					// Get a unique file path for export
					destination = getUniquePath(prefix + destination + suffix);
					destination += '.pdf';

					// Get page range
					if (asSpreads) { // Export as spreads
						range = String(scope[i].pages[0].documentOffset + 1)
							+ '-'
							+ String(scope[asPairs ? i + 1 : i].pages[-1].documentOffset + 1);
						if (asPairs && !(i % 2)) i++;
					} else { // Export as pages
						range = String(scope[i].documentOffset + 1);
					}

					progressBar.update2();
					progressBar.msg(baseFolder === decodeURI(doc.filePath)
						? decodeURI(File(destination).name)
						: destination);

					exportToPDF(destination, range, app.pdfExportPresets.item(preset));
				}
			} else { // Export all pages
				destination = getUniquePath(prefix + baseName + suffix);
				destination += '.pdf';

				progressBar.update();
				progressBar.msg(baseFolder === decodeURI(doc.filePath)
					? decodeURI(File(destination).name)
					: destination);

				exportToPDF(destination, PageRange.ALL_PAGES, app.pdfExportPresets.item(preset));
			}

			function getUniquePath(/*string*/filename) {
				var filesList, fileIndexRE, fileIndex, lastIndex, nextIndex;

				// Get a list of files from the base folder and recursively from the destination folder
				filesList = getFilesRecursively(Folder(baseFolder), false, undefined);
				if (destFolder !== baseFolder)
					filesList = filesList.concat(getFilesRecursively(Folder(destFolder), true, undefined));
				if (filesList.length > 1) filesList = unique(filesList.sort(naturalSorter));

				// Get the last index by matching 'filename [separator] ([previous index]) [stuff]
				lastIndex = 0;
				fileIndexRE = RegExp('^'
					+ filename.replace(regexTokensRE, '\\$&') // Escape regex tokens
					+ '(?:[ _-]*)'            // [NC: Separator]
					+ '(\\d+)?'               // [Previous index]
					+ '(?:[ _-]*v *\\d*)?'    // [NC: Ancillary: 'vX']
					+ '(?:[ _-]*copy *\\d*)?' // [NC: Ancillary: 'copyX']
					+ '(?:[ _-]*v *\\d*)?'    // [NC: Ancillary: 'vX']
					+ '(?:.*)$'               // [NC: Extra stuff]
					, 'i');
				for (var i = 0, n = filesList.length; i < n; i++) {
					fileIndex = fileIndexRE.exec(getFileName(decodeURI(filesList[i].name)));
					if (fileIndex)
						lastIndex = Math.max(lastIndex, isNaN(fileIndex[1]) ? 1 : Number(fileIndex[1]));
				}

				// Get the next index; add only values > 1
				nextIndex = exp.overwrite.value ? lastIndex : lastIndex + 1;
				nextIndex = nextIndex > 1 ? String(nextIndex) : '';

				return destFolder
					+ (exp.sortByDate.isOn.value ? '/'
						+ exp.sortByDate.et.text : '')  // [Date subfolder]
					+ '/' + filename                    // Base filename
					+ (!suffix && nextIndex ? ' ' : '') // [Separator]
					+ nextIndex;                        // Index
			}

			function exportToPDF(/*string*/filename, /*string|Enum*/pageRange, /*pdfExportPreset*/pdfPreset) {
				if (ScriptUI.environment.keyboardState.keyName === 'Escape') { cleanup(); exit(); }
				var fPg, lPg, spreadWidth;

				// Load preset settings
				for (var key in pdfPreset) {
					if (Object.prototype.hasOwnProperty.call(pdfPreset, key))
						try { app.pdfExportPreferences[key] = pdfPreset[key]; } catch (e) {}
				}

				// Override some settings
				app.pdfExportPreferences.pageRange = pageRange;
				app.pdfExportPreferences.cropMarks = exp.cropMarks.value;
				app.pdfExportPreferences.pageInformationMarks = exp.pageInfo.value;
				app.pdfExportPreferences.includeSlugWithPDF = exp.slugArea.value;
				app.pdfExportPreferences.exportReaderSpreads = exp.asSpreads.value;
				app.pdfExportPreferences.exportLayers = exp.exportLayers.enabled && exp.exportLayers.value;

				// Custom DPI
				if (exp.customDPI.isOn.value && app.pdfExportPreferences.colorBitmapSampling !== Sampling.NONE) {
					app.pdfExportPreferences.colorBitmapSamplingDPI = Number(exp.customDPI.et.text);
					app.pdfExportPreferences.grayscaleBitmapSamplingDPI = Number(exp.customDPI.et.text);
					app.pdfExportPreferences.monochromeBitmapSamplingDPI = (function (/*number*/dpi) {
						if (dpi <= 96) return 300;
						else if (dpi <= 150) return 600;
						else if (dpi < 300) return 1200;
						return 2400;
					}(Number(exp.customDPI.et.text)));
				}

				// Custom bleed
				app.pdfExportPreferences.useDocumentBleedWithPDF = !exp.customBleed.isOn.value;
				if (app.pdfExportPreferences.useDocumentBleedWithPDF) {
					app.pdfExportPreferences.pageMarksOffset = Math.min(
						Math.max(
							doc.documentPreferences.documentBleedTopOffset,
							doc.documentPreferences.documentBleedInsideOrLeftOffset,
							doc.documentPreferences.documentBleedBottomOffset,
							doc.documentPreferences.documentBleedOutsideOrRightOffset
						) + 1, // Offset page marks 1 mm --
						UnitValue('72 pt').as('mm')); // -- but limit to 72 pt
				} else {
					app.pdfExportPreferences.bleedTop
						= app.pdfExportPreferences.bleedBottom
						= app.pdfExportPreferences.bleedInside
						= app.pdfExportPreferences.bleedOutside
						= Number(exp.customBleed.et.text);
					app.pdfExportPreferences.pageMarksOffset
						= Math.min(app.pdfExportPreferences.bleedTop + 1, UnitValue('72 pt').as('mm'));
				}

				// Hack: Omit printer's marks if bleed is zero --
				// if ((doc.documentPreferences.documentBleedTopOffset
				// 		+ doc.documentPreferences.documentBleedInsideOrLeftOffset
				// 		+ doc.documentPreferences.documentBleedBottomOffset
				// 		+ doc.documentPreferences.documentBleedOutsideOrRightOffset === 0)
				// 		&& !app.pdfExportPreferences.includeSlugWithPDF) { // -- but not if user wants slug
				// 	app.pdfExportPreferences.cropMarks = false;
				// 	app.pdfExportPreferences.pageInformationMarks = false;
				// }

				// Hack: Don't include page information on pages with very small widths
				if (pageRange === PageRange.ALL_PAGES) {
					fPg = scope.constructor.name === 'Spreads' ? scope[0].pages[0]  : scope[0];
					lPg = scope.constructor.name === 'Spreads' ? scope[0].pages[-1] : scope[0];
				} else if (/-/.test(pageRange)) {
					fPg = doc.pages.item(pageRange.slice(0, pageRange.lastIndexOf('-')));
					lPg = doc.pages.item(pageRange.slice(pageRange.lastIndexOf('-') + 1));
				} else { fPg = lPg = doc.pages.item(pageRange); }
				spreadWidth = (scope.constructor.name === 'Spreads' ? lPg.bounds[3] : fPg.bounds[3]) - fPg.bounds[1];
				if (spreadWidth < UnitValue('335 pt').as('mm')) app.pdfExportPreferences.pageInformationMarks = false;

				// Export
				if (exp.overwrite.value && File(filename).exists)
					try { File(filename).remove(); } catch (e) {}
				doc.exportFile(ExportFormat.PDF_TYPE, File(filename), false);
				if (ScriptUI.environment.keyboardState.keyName === 'Escape') { cleanup(); exit(); }
			}
		}
	}

	function showDialog() {
		var exportPresetsPDF = app.pdfExportPresets.everyItem().name.sort(naturalSorter);
		var createWorkflowUI = {
			column: function (workflow) {
				ui[workflow] = ui.presets.add('group { orientation: "column", alignChildren: [ "left", "top" ] }');
				ui[workflow].preferredSize.width = ui.cWidth;

				// On/Off switch and label
				ui[workflow]._ = ui[workflow].add('group { orientation: "row" }');
				ui[workflow].isOn = ui[workflow]._.add('checkbox { alignment: "bottom", preferredSize: [ 125, -1 ] }');
				ui[workflow].isOn.text = workflow.replace('workflow', 'Workflow #');
				ui[workflow].label = ui[workflow]._.add('edittext { justify: "center", preferredSize: [ 159, 24 ] }');
				ui[workflow].label.helpTip = 'Add a descriptive label';

				// Preset options
				ui[workflow].container = ui[workflow].add('group { orientation: "column", alignChildren: [ "left", "top" ] }');
				ui[workflow].preset = ui[workflow].container.add('dropdownlist', undefined, exportPresetsPDF);
				ui[workflow].preset.preferredSize = [ ui.cWidth, 24 ];
				ui[workflow].po = ui[workflow].container.add('group { orientation: "row", margins: [ 0, 0, 0, -5 ], alignChildren: [ "left", "top" ] }');
					ui[workflow].po.c1 = ui[workflow].po.add('group { orientation: "column", spacing: 5, alignChildren: [ "left", "top" ], preferredSize: [ 125, -1 ] }');
						ui[workflow].cropMarks = ui[workflow].po.c1.add('checkbox { text: "Crop marks", preferredSize: [ -1, 24 ] }');
						ui[workflow].pageInfo = ui[workflow].po.c1.add('checkbox { text: "Page information", preferredSize: [ -1, 24 ] }');
						ui[workflow].slugArea = ui[workflow].po.c1.add('checkbox { text: "Include slug area", preferredSize: [ -1, 24 ] }');
					ui[workflow].po.c2 = ui[workflow].po.add('group { orientation: "column", spacing: 5, alignChildren: [ "left", "top" ] }');
						ui[workflow].asSpreads = ui[workflow].po.c2.add('checkbox { text: "Export as spreads" }');
						ui[workflow].asSpreads.helpTip = 'Exports pages together as if they\nwere printed on the same sheet';
						ui[workflow].customDPI = ui[workflow].po.c2.add('group { orientation: "row" }');
							ui[workflow].customDPI.isOn = ui[workflow].customDPI.add('checkbox { text: "Custom DPI:", alignment: "bottom", preferredSize: [ 104, -1 ] }');
							ui[workflow].customDPI.isOn.helpTip = 'Override profile resolution';
							ui[workflow].customDPI.et = ui[workflow].customDPI.add('edittext { justify: "center", preferredSize: [ 45, 24 ] }');
						ui[workflow].customBleed = ui[workflow].po.c2.add('group { orientation: "row" }');
							ui[workflow].customBleed.isOn = ui[workflow].customBleed.add('checkbox { text: "Custom bleed:", alignment: "bottom", preferredSize: [ 104, -1 ] }');
							ui[workflow].customBleed.isOn.helpTip = 'Override document bleed';
							ui[workflow].customBleed.et = ui[workflow].customBleed.add('edittext { characters: 4, justify: "center", preferredSize: [ 45, 24 ] }');
				ui[workflow].exportLayers = ui[workflow].container.add('checkbox { text: "Create Acrobat layers" }');
				ui[workflow].exportLayers.helpTip = 'Saves each InDesign layer as an Acrobat layer\nwithin the PDF (available for PDF 1.5 or later)';

				// Document actions
				ui[workflow].container.add('panel { alignment: "fill" }');
				ui[workflow].updateLinks = ui[workflow].container.add('checkbox { text: "Update out of date links" }');
				ui[workflow].skipDNP = ui[workflow].container.add('group { orientation: "row", margins: [ 0, -5, 0, -5 ] }');
					ui[workflow].skipDNP.isOn = ui[workflow].skipDNP.add('checkbox { text: "Skip do-not-print layers", alignment: "bottom" }');
					ui[workflow].skipDNP.isOn.helpTip = 'Layers with names beginning with a dot or a hyphen\n(e.g., \'.safety area\') can be automatically skipped';
					ui[workflow].skipDNP.add('group').preferredSize.width = ui.cWidth - 245;
					ui[workflow].skipDNP.editList = ui[workflow].skipDNP.add('button { text: "Edit list", preferredSize: [ 64, 24 ] }');
					ui[workflow].skipDNP.editList.helpTip = 'Edit do-not-print layers list';
				ui[workflow].script = ui[workflow].container.add('group { orientation: "column", alignChildren: [ "left", "top" ] }');
					ui[workflow].script._ = ui[workflow].script.add('group { orientation: "row", margins: [ 0, 0, 0, -5 ] }');
						ui[workflow].script.isOn = ui[workflow].script._.add('checkbox { text: "Run a script:", alignment: "bottom" }');
						ui[workflow].script.isOn.helpTip = 'Run a JavaScript or AppleScript before exporting';
						ui[workflow].script._.add('group').preferredSize.width = ui.cWidth - 176;
						ui[workflow].script.browse = ui[workflow].script._.add('button { text: "Browse", preferredSize: [ 64, 24 ] }');
					ui[workflow].script.file = ui[workflow].script.add('edittext');
					ui[workflow].script.file.preferredSize = [ ui.cWidth, 24 ];

				// Output options
				ui[workflow].container.add('panel { alignment: "fill" }');
				ui[workflow].destination = ui[workflow].container.add('group { orientation: "column", alignChildren: [ "left", "top" ] }');
					ui[workflow].destination._ = ui[workflow].destination.add('group { orientation: "row", margins: [ 0, 0, 0, -5 ] }');
						ui[workflow].destination.isOn = ui[workflow].destination._.add('checkbox { text: "Export in a custom folder:", alignment: "bottom" }');
						ui[workflow].destination.isOn.helpTip = 'By default the files are exported in the same folder as\nthe source document, but you can choose a custom one';
						ui[workflow].destination._.add('group').preferredSize.width = ui.cWidth - 254;
						ui[workflow].destination.browse = ui[workflow].destination._.add('button { text: "Browse", preferredSize: [ 64, 24 ] }');
					ui[workflow].destination.folder = ui[workflow].destination.add('edittext');
					ui[workflow].destination.folder.preferredSize = [ ui.cWidth, 24 ];
				ui[workflow].prefix = ui[workflow].container.add('group { orientation: "row", margins: [ 0, -5, 0, 0 ] }');
					ui[workflow].prefix.isOn = ui[workflow].prefix.add('checkbox { text: "Prepend a prefix:", alignment: "bottom", preferredSize: [ 164, -1 ] }');
					ui[workflow].prefix.isOn.helpTip = 'Prepend a prefix to the exported file name';
					ui[workflow].prefix.et = ui[workflow].prefix.add('edittext { preferredSize: [ 120, 24 ] }');
					ui[workflow].prefix.et.helpTip = 'Prepend this text to the exported file name';
				ui[workflow].suffix = ui[workflow].container.add('group { orientation: "row", margins: [ 0, -5, 0, 0 ] }');
					ui[workflow].suffix.isOn = ui[workflow].suffix.add('checkbox { text: "Append a suffix:", alignment: "bottom", preferredSize: [ 164, -1 ] }');
					ui[workflow].suffix.isOn.helpTip = 'Append a suffix to the exported file name';
					ui[workflow].suffix.et = ui[workflow].suffix.add('edittext { preferredSize: [ 120, 24 ] }');
					ui[workflow].suffix.et.helpTip = 'Append this text to the exported file name';
				ui[workflow].sortInSubfolders = ui[workflow].container.add('group { orientation: "row", margins: [ 0, -5, 0, 0 ] }');
					ui[workflow].sortInSubfolders.isOn = ui[workflow].sortInSubfolders.add('checkbox { text: "Sort files into subfolder:", alignment: "bottom", preferredSize: [ 164, -1 ] }');
					ui[workflow].sortInSubfolders.isOn.helpTip = 'Export files into subfolders';
					ui[workflow].sortInSubfolders.et = ui[workflow].sortInSubfolders.add('edittext { preferredSize: [ 120, 24 ] }');
					ui[workflow].sortInSubfolders.et.helpTip = 'Export files into this subfolder\nNote: everything after a \'+\' is ignored';
				ui[workflow].sortByDate = ui[workflow].container.add('group { orientation: "row", margins: [ 0, -5, 0, 0 ] }');
					ui[workflow].sortByDate.isOn = ui[workflow].sortByDate.add('checkbox { text: "Sort files by date into:", alignment: "bottom", preferredSize: [ 164, -1 ] }');
					ui[workflow].sortByDate.isOn.helpTip = 'Export files into subfolders by date (\'MM.DD\')';
					ui[workflow].sortByDate.et = ui[workflow].sortByDate.add('edittext { preferredSize: [ 46, 24 ] }');
					ui[workflow].sortByDate.et.helpTip = 'MM.DD, where MM: 01\u201312; DD: 01\u201331';
					ui[workflow].sortByDate.et.text = time.MMDD;
					ui[workflow].sortByDate.now = ui[workflow].sortByDate.add('button { text: "Today", preferredSize: [ 64, 24 ] }');
					ui[workflow].sortByDate.now.helpTip = 'Reset to today';
				ui[workflow].split = ui[workflow].container.add('checkbox { text: "Export as separate pages/spreads" }');
				ui[workflow].overwrite = ui[workflow].container.add('checkbox { text: "Overwrite existing files" }');

				// Updating source
				ui[workflow].container.add('panel { alignment: "fill" }');
				ui[workflow].docSave = ui[workflow].container.add('checkbox { text: "Save modified documents" }');
				ui[workflow].saveAs = ui[workflow].container.add('checkbox { text: "Use \'Save as\u2026\' to reduce size" }');
			},
			events: function (workflow) {
				ui[workflow].isOn.onClick = function () {
					ui[workflow].container.enabled = this.value;
					ui[workflow].label.enabled = this.value;

					ui[workflow].customDPI.isOn.onClick();
					ui[workflow].customBleed.isOn.onClick();
					ui[workflow].skipDNP.isOn.onClick();
					ui[workflow].prefix.isOn.onClick();
					ui[workflow].suffix.isOn.onClick();
					ui[workflow].sortInSubfolders.isOn.onClick();
					ui[workflow].sortByDate.isOn.onClick();
					ui[workflow].script.isOn.onClick();
					ui[workflow].destination.isOn.onClick();
					ui[workflow].docSave.onClick();
				};

				ui[workflow].preset.onChange = function () {
					var str = this.selection.text;
					var pdfExpPreset = app.pdfExportPresets.item(str);

					ui[workflow].cropMarks.value = pdfExpPreset.cropMarks;
					ui[workflow].pageInfo.value = pdfExpPreset.pageInformationMarks;
					ui[workflow].slugArea.value = pdfExpPreset.includeSlugWithPDF;
					ui[workflow].asSpreads.value = pdfExpPreset.exportReaderSpreads;

					ui[workflow].exportLayers.value = pdfExpPreset.exportLayers;
					ui[workflow].exportLayers.enabled
						= Number(String(pdfExpPreset.acrobatCompatibility).replace('ACROBAT_', '')) >= 6;

					ui[workflow].customDPI.isOn.value = false;
					ui[workflow].customDPI.isOn.enabled = !(pdfExpPreset.colorBitmapSampling === Sampling.NONE);
					ui[workflow].customDPI.isOn.onClick();

					if (pdfExpPreset.useDocumentBleedWithPDF) {
						ui[workflow].customBleed.isOn.value = false;
						ui[workflow].customBleed.isOn.onClick();
					} else {
						ui[workflow].customBleed.isOn.value = true;
						ui[workflow].customBleed.isOn.onClick();
						ui[workflow].customBleed.et.text
							= Math.max(pdfExpPreset.bleedTop, pdfExpPreset.bleedInside,
								pdfExpPreset.bleedBottom, pdfExpPreset.bleedOutside)
									.toFixed(2)
									.replace(/\.?0+$/, '');
					}

					ui[workflow].prefix.isOn.onClick();

					ui[workflow].suffix.et.text = /_/g.test(str) ? str.replace(/^.*_/, '') : '';
					ui[workflow].suffix.isOn.onClick();

					ui[workflow].sortInSubfolders.et.text
						= /_/g.test(str)
							? str.replace(/^.*_/, '').replace(/\+.*$/, '')
							: '';
					ui[workflow].sortInSubfolders.isOn.onClick();

					this.helpTip = (function (/*pdfExportPreset*/preset) {
						var msg = [];

						msg.push('Profile: '
							+ (preset.pdfDestinationProfile.constructor.name === 'String'
								? preset.effectivePDFDestinationProfile
								: String(preset.pdfDestinationProfile)
									.toLowerCase()
									.replace(/_/g, ' ')
									.replace('use ', '')
							)
						);

						if (preset.standardsCompliance !== PDFXStandards.NONE) {
							msg.push('Standard: '
								+ String(preset.standardsCompliance)
									.toLowerCase()
									.replace(/^(pdfx)(.+?)(\d{4})(_standard)$/, 'PDF/X-$2:$3')
							);
						}

						msg.push('Compatibility: Acrobat '
							+ (function (ver) {
								return {
									4: '4 (PDF 1.3)',
									5: '5 (PDF 1.4)',
									6: '6 (PDF 1.5)',
									7: '7 (PDF 1.6)',
									8: '8/9 (PDF 1.7)'
								}[ver] || ver;
							}(String(preset.acrobatCompatibility).replace('ACROBAT_', '')))
						);

						msg.push('Color space: '
							+ String(preset.pdfColorSpace)
								.toLowerCase()
								.replace(/_/g, ' ')
								.replace(' color space', '')
								.replace('rgb', 'RGB')
								.replace('cmyk', 'CMYK')
						);

						if (preset.colorBitmapSampling === Sampling.NONE) {
							msg.push('Sampling: none');
						} else {
							msg.push('Sampling: '
								+ String(preset.colorBitmapSampling)
									.toLowerCase()
									.replace(/_/g, ' '));
							msg.push('Resolution: ' + preset.colorBitmapSamplingDPI + ' dpi');
						}

						msg.push('Compression: '
							+ String(preset.colorBitmapCompression)
								.toLowerCase()
								.replace(/_/g, ' ')
								.replace(' compression', '')
						);
						if (preset.colorBitmapCompression !== BitmapCompression.NONE
								&& preset.colorBitmapCompression !== BitmapCompression.ZIP) {
							msg.push('Quality: '
								+ String(preset.colorBitmapQuality)
									.toLowerCase()
									.replace(/_/g, ' ')
							);
						}

						msg.push('\nExport as ' + (preset.exportReaderSpreads ? 'spreads' : 'pages'));

						if (preset.useDocumentBleedWithPDF) {
							msg.push('Use document bleed');
						} else {
							msg.push('Use custom bleed: '
								+ Math.max(preset.bleedTop, preset.bleedInside, preset.bleedBottom, preset.bleedOutside)
									.toFixed(2)
									.replace(/\.?0+$/, '') + ' mm'
							);
						}

						if (preset.cropMarks
								|| preset.pageInformationMarks
								|| preset.includeSlugWithPDF
								|| preset.exportLayers) {
							msg.push('Include '
								+ ((preset.cropMarks ? 'crop marks, ' : '')
									+ (preset.pageInformationMarks ? 'page info, ' : '')
									+ (preset.includeSlugWithPDF ? 'slug area, ' : '')
									+ (preset.exportLayers ? 'layers, ' : '')
								).replace(/, $/, '')
							);
						}

						return msg.join('\n');
					}(pdfExpPreset));
				};

				ui[workflow].customDPI.isOn.onClick = function () {
					var pdfExpPreset = app.pdfExportPresets.item(ui[workflow].preset.selection.text);

					this.parent.et.enabled = this.value;
					if (pdfExpPreset.colorBitmapSampling === Sampling.NONE) {
						this.parent.et.enabled = false;
						this.parent.et.text = '';
						this.parent.et.helpTip = 'Sampling is disabled';
					} else if (this.parent.et.enabled) {
						this.parent.et.helpTip = 'Valid interval: 9\u20132400 dpi';
						this.parent.et.onDeactivate();
					} else {
						this.parent.et.text = pdfExpPreset.colorBitmapSamplingDPI;
						this.parent.et.helpTip = 'Using profile resolution';
					}
				};

				ui[workflow].customDPI.et.onDeactivate = function () {
					this.text = Number(this.text
						.replace(/[^\d.,]/gi, '')
						.replace(',', '.')
					);
					if (isNaN(this.text) || this.text < 9 || this.text > 2400) {
						alert('Out of bounds\nEnter a value between 9 and 2400.');
						this.parent.isOn.value = false;
						this.parent.isOn.onClick();
					}
				};

				ui[workflow].customBleed.isOn.onClick = function () {
					this.parent.et.enabled = this.value;
					if (this.parent.et.enabled) {
						this.parent.et.helpTip = 'Valid interval: 0\u2013152.4 mm';
						this.parent.et.onDeactivate();
					} else {
						this.parent.et.text = '';
						this.parent.et.helpTip = 'Using documend bleed';
					}
				};

				ui[workflow].customBleed.et.onDeactivate = function () {
					this.text = Number(this.text
						.replace(/[^\d.,]/gi, '')
						.replace(',', '.')
					);
					if (UnitValue(this.text, 'mm').as('pt') > 432.0001) {
						alert('Out of bounds\nEnter a value between 0 and 152.4.');
						this.parent.isOn.value = false;
						this.parent.isOn.onClick();
					}
				};

				ui[workflow].skipDNP.isOn.onClick = function () {
					this.parent.editList.enabled = this.value;
				};

				ui[workflow].skipDNP.editList.onClick = function () {
					var w = new Window('dialog { orientation: "column", alignChildren: [ "left", "top" ], margins: [ 16, 13, 16, 16 ], spacing: 10 }');
					w.text = 'Edit do-not-print layers';

					w.legend = w.add('group { orientation: "column", alignChildren: [ "left", "top" ], spacing: 0 }');
						w.legend.add('statictext { text: "Enter a list of layers to be skipped on export." }');
						w.legend.add('statictext { text: "Layers with names beginning with a dot or a hyphen" }');
						w.legend.add('statictext { text: "(e.g., \'.safety area\') will be automatically skipped." }');
						w.legend.add('statictext');
						w.legend.add('statictext { text: "You can use a \'?\' wildcard for any character, or a \'*\'" }');
						w.legend.add('statictext { text: "for zero or more characters." }');
					w.list = w.add('edittext { justify: "left", properties: { multiline: true, scrollable: true } }');
						w.list.preferredSize = [ 320, 152 ];
						w.list.text = settings.dnpLayers;
					w.actions = w.add('group { orientation: "row", margins: [ -1, 4, -1, -1 ] }');
						w.actions.reset = w.actions.add('button { text: "Reset", preferredSize: [ 80, 24 ] }');
						w.actions.add('group').preferredSize.width = 50;
						w.actions.add('button { text: "Cancel", preferredSize: [ 80, 24 ] }');
						w.actions.ok = w.actions.add('button { text: "OK", preferredSize: [ 80, 24 ] }');

					w.list.onDeactivate = function () {
						w.list.text = w.list.text
							.replace(/\|/g, '\n')       // Convert '|' to CR
							.replace(/(\s)+/g, '$1')    // Compact whitespace
							.replace(/^\s+|\s+$/g, ''); // Trim whitespaces at both ends
						w.list.text = w.list.text
							.replace(/( ?, ?)+/g, ',')  // Compact commas
							.replace(/^,+|,+$/gm, '')   // Trim commas at both ends
							.replace(/,/g, ', ');       // Add a space after commas
					};

					w.actions.reset.onClick = function () {
						w.list.text = defaults.dnpLayers.replace(/\|/g, '\n');
						w.list.onDeactivate();
					};

					w.actions.ok.onClick = function () {
						settings.dnpLayers = w.list.text;
						w.close();
					};

					w.onShow = function () { w.center(ui); };

					w.show();
				};

				ui[workflow].script.isOn.onClick = function () {
					this.parent.parent.browse.enabled = this.value;
					this.parent.parent.file.enabled = this.value;
					this.parent.parent.file.onChange();
				};

				ui[workflow].script.browse.onClick = function () {
					var f = File.openDialog('Select a script:');
					if (f != null) this.parent.parent.file.text = f;
					this.parent.parent.file.onChange();
				};

				ui[workflow].script.file.onChange = function () {
					if (File(this.parent.path).exists
						&& decodeURI(File(this.parent.path).name) === this.text) return;
					var newFile = File(this.text);
					if (newFile.exists
							&& (WIN
								? /\.(jsx*(bin)*)$/i.test(newFile)
								: /\.(jsx*(bin)*|scpt)$/i.test(newFile)
							)
						) {
						this.parent.path = decodeURI(newFile);
						this.text = decodeURI(newFile.name);
						this.helpTip = beautifyPath(newFile);
					} else {
						this.parent.path = this.text;
					}
					checkStatus();
				};

				ui[workflow].script.file.onActivate = function () {
					if (File(this.parent.path).exists)
						this.text = decodeURI(File(this.parent.path));
				};

				ui[workflow].script.file.onDeactivate = function () {
					this.onChange();
				};

				ui[workflow].destination.isOn.onClick = function () {
					this.parent.parent.folder.enabled
						= this.parent.parent.browse.enabled
						= this.value;

					if (this.value) {
						if (this.parent.parent.folder.text === 'Using documents folders')
							this.parent.parent.folder.text = this.parent.parent.path;
					} else {
						this.parent.parent.folder.text = 'Using documents folders';
					}

					this.parent.parent.folder.onChange();
				};

				ui[workflow].destination.browse.onClick = function () {
					var ff = Folder.selectDialog('Select a folder:');
					if (ff != null) this.parent.parent.folder.text = ff;
					this.parent.parent.folder.onChange();
				};

				ui[workflow].destination.folder.onChange = function () {
					if (Folder(this.parent.path).exists
							&& decodeURI(Folder(this.parent.path).name) === this.text) {
						checkStatus();
						return;
					}

					var newFolder = Folder(this.text);
					if (newFolder.exists) {
						this.parent.path = decodeURI(newFolder);
						this.text = decodeURI(newFolder.name);
						this.helpTip = beautifyPath(newFolder);
					} else {
						if (this.text !== 'Using documents folders') this.parent.path = this.text;
						this.helpTip = 'Folder not found';
					}
					checkStatus();
				};

				ui[workflow].destination.folder.onActivate = function () {
					this.text = this.parent.path;
				};

				ui[workflow].destination.folder.onDeactivate = function () {
					this.onChange();
				};

				ui[workflow].prefix.isOn.onClick = function () {
					this.parent.et.enabled = this.value;
					this.parent.et.onChange();
				};

				ui[workflow].prefix.et.onChange = function () {
					var str = this.text
						.replace(/^\s+|\s+$/g, '')
						.replace(invalidFilenameCharsRE, '');
					if (str !== this.text) this.text = str;
				};

				ui[workflow].prefix.et.onDeactivate = function () {
					this.onChange();
				};

				ui[workflow].suffix.isOn.onClick = function () {
					this.parent.et.enabled = this.value;
					this.parent.et.onChange();
				};

				ui[workflow].suffix.et.onChange = function () {
					var str = this.text
						.replace(/^\s+|\s+$/g, '')
						.replace(invalidFilenameCharsRE, '')
						.replace(/^_/, '');
					if (str !== this.text) this.text = str;
				};

				ui[workflow].suffix.et.onDeactivate = function () {
					this.onChange();
				};

				ui[workflow].sortInSubfolders.isOn.onClick = function () {
					this.parent.et.enabled = this.value;
					this.parent.et.onChange();
				};

				ui[workflow].sortInSubfolders.et.onChange = function () {
					var str = this.text
						.replace(/^\s+|\s+$/g, '')
						.replace(invalidFilenameCharsRElaxed, '')
						.replace(/^_/, '')
						.replace(/\+.*$/, '');
					if (this.text !== str) this.text = str;
				};

				ui[workflow].sortInSubfolders.et.onDeactivate = function () {
					this.onChange();
				};

				ui[workflow].sortByDate.isOn.onClick = function () {
					this.parent.now.enabled = this.value;
					this.parent.et.enabled = this.value;
				};

				ui[workflow].sortByDate.et.onDeactivate = function () {
					var md, str;
					str = this.text
						.replace(/^\s+|\s+$/g, '')
						.replace(',', '.')
						.replace(/[^\d.]/gi, '');
					md = str.match(/^(\d{1,2})\.(\d{1,2})$/i);
					if (md && Number(md[1]) >= 1 && Number(md[1]) <= 12
							&& Number(md[2]) >= 1 && Number(md[2]) <= 31) {
						this.text = zeroPad(Number(md[1]), 2) + '.' + zeroPad(Number(md[2]), 2);
					} else {
						alert('Invalid date\nEnter an MM.DD string, where\nMM: 1\u201312\nDD: 1\u201331.');
						this.parent.now.onClick();
					}
				};

				ui[workflow].sortByDate.now.onClick = function () {
					ui[workflow].sortByDate.et.text = time.MMDD;
				};

				ui[workflow].docSave.onClick = function () {
					this.parent.parent.saveAs.enabled = this.value;
				};
			}
		};
		var prefs = {
			read: function () {
				if (settingsFile.length === 0) this.reset();
				try { settings = $.evalFile(settingsFile); } catch (e) { this.reset(); }
				if (settings.version === undefined || settings.version !== VER) this.reset();

				for (var i = 1, workflow; i <= 2; i++) {
					workflow = 'workflow' + i;
					ui[workflow].isOn.value = settings[workflow].active;
					ui[workflow].label.text = settings[workflow].label;
					ui[workflow].preset.selection
						= findPresetIndex(settings[workflow].presetName, ui[workflow].preset.items);
					ui[workflow].cropMarks.value             = settings[workflow].presetOptions.cropMarks;
					ui[workflow].pageInfo.value              = settings[workflow].presetOptions.pageInfo;
					ui[workflow].slugArea.value              = settings[workflow].presetOptions.slugArea;
					ui[workflow].asSpreads.value             = settings[workflow].presetOptions.asSpreads;
					ui[workflow].customDPI.isOn.value        = settings[workflow].presetOptions.customDPI.active;
					ui[workflow].customDPI.et.text           = settings[workflow].presetOptions.customDPI.value;
					ui[workflow].customBleed.isOn.value      = settings[workflow].presetOptions.customBleed.active;
					ui[workflow].customBleed.et.text         = settings[workflow].presetOptions.customBleed.value;
					ui[workflow].exportLayers.value          = settings[workflow].presetOptions.exportLayers;
					ui[workflow].updateLinks.value           = settings[workflow].docActions.updateLinks;
					ui[workflow].skipDNP.isOn.value          = settings[workflow].docActions.skipDNP;
					ui[workflow].script.file.text            = settings[workflow].docActions.script.value;
					ui[workflow].script.isOn.value           = settings[workflow].docActions.script.active;
					ui[workflow].destination.folder.text     = settings[workflow].outputOptions.destination.value;
					ui[workflow].destination.path            = settings[workflow].outputOptions.destination.value;
					ui[workflow].destination.isOn.value      = settings[workflow].outputOptions.destination.active;
					ui[workflow].prefix.et.text              = settings[workflow].outputOptions.prefix.value;
					ui[workflow].prefix.isOn.value           = settings[workflow].outputOptions.prefix.active;
					ui[workflow].suffix.et.text              = settings[workflow].outputOptions.suffix.value;
					ui[workflow].suffix.isOn.value           = settings[workflow].outputOptions.suffix.active;
					ui[workflow].sortInSubfolders.et.text    = settings[workflow].outputOptions.sortInSubfolders.value;
					ui[workflow].sortInSubfolders.isOn.value = settings[workflow].outputOptions.sortInSubfolders.active;
					ui[workflow].sortByDate.isOn.value       = settings[workflow].outputOptions.sortByDate.active;
					ui[workflow].split.value                 = settings[workflow].outputOptions.split;
					ui[workflow].overwrite.value             = settings[workflow].outputOptions.overwrite;
					ui[workflow].docSave.value               = settings[workflow].outputOptions.docSave.active;
					ui[workflow].saveAs.value                = settings[workflow].outputOptions.docSave.saveAs;
				}
				ui.actions.updateVersion.value = settings.updateVersion;
				ui.actions.docClose.value = settings.docClose;
				settings.dnpLayers = settings.dnpLayers
					.replace(/,/g, ', ')
					.replace(/\|/g, '\n');

				ui.workflow1.isOn.onClick();
				ui.workflow2.isOn.onClick();

				function findPresetIndex(/*string*/presetName, /*array*/presetsArray) {
					if (app.pdfExportPresets.itemByName(presetName).isValid) {
					for (var i = 0, n = presetsArray.length; i < n; i++)
						if (presetsArray[i].toString() === presetName) return presetsArray[i].index;
					}
					return 0;
				}
			},
			save: function () {
				for (var i = 1, workflow; i <= 2; i++) {
					workflow = 'workflow' + i;
					settings[workflow] = {};
					settings[workflow].active = ui[workflow].isOn.value;
					settings[workflow].label  = ui[workflow].label.text;
					settings[workflow].presetName = ui[workflow].preset.selection.text;
					settings[workflow].presetOptions = {
						cropMarks: ui[workflow].cropMarks.value,
						pageInfo:  ui[workflow].pageInfo.value,
						slugArea:  ui[workflow].slugArea.value,
						asSpreads: ui[workflow].asSpreads.value,
						customDPI: {
							active: ui[workflow].customDPI.isOn.value,
							value:  ui[workflow].customDPI.et.text
						},
						customBleed: {
							active: ui[workflow].customBleed.isOn.value,
							value:  ui[workflow].customBleed.et.text
						},
						exportLayers: ui[workflow].exportLayers.value
					};
					settings[workflow].docActions = {
						updateLinks: ui[workflow].updateLinks.value,
						skipDNP:     ui[workflow].skipDNP.isOn.value,
						script: {
							active: ui[workflow].script.isOn.value,
							value:  ui[workflow].script.path
						}
					};
					settings[workflow].outputOptions = {
						destination: {
							active: ui[workflow].destination.isOn.value,
							value:  ui[workflow].destination.path || ''
						},
						prefix: {
							active: ui[workflow].prefix.isOn.value,
							value:  ui[workflow].prefix.et.text
						},
						suffix: {
							active: ui[workflow].suffix.isOn.value,
							value:  ui[workflow].suffix.et.text
						},
						sortInSubfolders: {
							active: ui[workflow].sortInSubfolders.isOn.value,
							value:  ui[workflow].sortInSubfolders.et.text
						},
						sortByDate: {
							active: ui[workflow].sortByDate.isOn.value,
							value:  ui[workflow].sortByDate.et.text
						},
						split: ui[workflow].split.value,
						overwrite: ui[workflow].overwrite.value,
						docSave: {
							active: ui[workflow].docSave.value,
							saveAs: ui[workflow].saveAs.value
						}
					};
				}
				settings.updateVersion = ui.actions.updateVersion.value;
				settings.docClose = ui.actions.docClose.value;
				settings.dnpLayers = settings.dnpLayers
					.replace(/ *, +/g, ',')
					.replace(/\n|\r/g, '|');
				settings.position = [ ui.location[0], ui.location[1] ];
				settings.version = VER;

				try {
					old.settings = $.evalFile(settingsFile);
					if (settings.toSource() === old.settings.toSource()) return;
				} catch (e) {}

				settingsFile.open('w');
				settingsFile.encoding = 'UTF-8';
				settingsFile.lineFeed = 'Unix';
				settingsFile.write(settings.toSource());
				settingsFile.close();
			},
			reset: function () {
				if (settingsFile.exists)
					alert('Preferences were reset.\nEither the file was an old version, or it was corrupt.');
				try {
					settingsFile.remove();
				} catch (e) {}
				settings = defaults;
			}
		};

		ui = new Window('dialog { orientation: "column", margins: 16, spacing: 10, alignChildren: [ "left", "top" ] }');
		ui.wWidth = 634; // Window width
		ui.cWidth = (ui.wWidth - 2 * (16 + 10 - 4)) / 2 - 1; // Column width
		ui.preferredSize.width = ui.wWidth;
		ui.text = title;

		// Input source
		if (isFolderMode) {
			ui.input = ui.add('panel { text: "Select a source folder", orientation: "column", margins: [ 10, 15, 10, 5 ] }');
			ui.input.alignChildren = 'left';
				ui.input.source = ui.input.add('group { orientation: "row" }');
					ui.input.source.folder = ui.input.source.add('edittext');
					ui.input.source.folder.preferredSize = [ ui.wWidth - 114, 24 ];
					ui.input.source.browse = ui.input.source.add('button { text: "Browse", preferredSize: [ 80, 24 ] }');
				ui.input.options = ui.input.add('group { orientation: "row" }');
					ui.input.options.includeSubfolders = ui.input.options.add('checkbox { text: "Include subfolders" }');
		}

		// Workflows
		ui.presets = ui.add('panel { orientation: "row", margins: [ 10, 10, 10, 5 ] }');
		ui.presets.alignChildren = [ 'fill', 'top' ];
		createWorkflowUI.column('workflow1');
		ui.presets.add('panel { alignment: "fill" }');
		createWorkflowUI.column('workflow2');

		// Actions
		ui.actions = ui.add('group { orientation: "row", alignChildren: [ "left", "center" ], margins: [ -1, 4, -1, -1 ] }');
			ui.actions.updateVersion = ui.actions.add('checkbox { text: "Upgrade [Converted] documents", alignment: "bottom" }');
			ui.actions.updateVersion.helpTip = 'Automatically upgrade [Converted] documents\n(if unchecked, they will be skipped)';
			ui.actions.docClose = ui.actions.add('checkbox { text: "Close documents after export", alignment: "bottom" }');
			ui.actions.docClose.value = true;
			ui.actions.docClose.enabled = !isFolderMode;
			if (isFolderMode) ui.actions.docClose.helpTip = 'In batch folder mode documents are always closed after export';
			ui.actions.add('group').preferredSize.width = ui.wWidth - 598;
				ui.actions.add('button { text: "Cancel", preferredSize: [ 80, 24 ], properties: { name: "cancel" } }');
				ui.actions.ok = ui.actions.add('button { text: "Start", preferredSize: [ 80, 24 ], properties: { name: "ok" } }');

		// Events

		// Input source
		if (isFolderMode) {
			ui.input.source.browse.onClick = function () {
				var ff = Folder.selectDialog('Select a folder:');
				if (ff != null) this.parent.folder.text = ff;
				this.parent.folder.onChange();
			};

			ui.input.source.folder.onChange = function () {
				if (Folder(this.text).exists) {
					this.parent.path = this.text;
					this.text = beautifyPath(Folder(this.parent.path));
				} else {
					this.parent.path = this.text;
				}
				checkStatus();
			};
		}

		// Workflows
		createWorkflowUI.events('workflow1');
		createWorkflowUI.events('workflow2');

		// Actions
		ui.actions.updateVersion.onClick = function () {
			if (this.value) {
				ui.workflow1.docSave.value = true;
				if (ui.workflow1.isOn) ui.workflow1.docSave.onClick();
				ui.workflow2.docSave.value = true;
				if (ui.workflow2.isOn) ui.workflow2.docSave.onClick();
			}
		};

		// Show/Close
		ui.onShow = function () {
			prefs.read();
			if (settings.position !== '') {
				try { ui.location = settings.position; } catch (e) {} // Use saved position
			} else if (app.windows.length > 0) { // Center in current window
				ui.frameLocation = [
					(app.activeWindow.bounds[1] + app.activeWindow.bounds[3] - ui.frameSize.width) / 2,
					app.activeWindow.bounds[0]
						+ (app.activeWindow.bounds[0] + app.activeWindow.bounds[2] - ui.frameSize.height) / 2
				];
			}
			checkStatus();
		};

		ui.onClose = function () {
			if (!ScriptUI.environment.keyboardState.altKey) prefs.save();
		};

		return ui.show();

		function checkStatus() {
			var i, workflow;

			// Start with a clean state
			ui.text = title;
			ui.actions.ok.enabled = true;
			ui.actions.ok.helpTip = '';

			// Update help tips for mandatory items

			if (isFolderMode) {
				if (ui.input.source.folder.text.length === 0) {
					ui.input.source.folder.helpTip = 'Select a folder';
				} else {
					ui.input.source.folder.helpTip = Folder(ui.input.source.path).exists
						? beautifyPath(Folder(ui.input.source.path))
						: 'Folder not found';
				}
			}

			for (i = 1; i <= 2; i++) {
				workflow = 'workflow' + i;

				if (ui[workflow].script.isOn.value) {
					if (ui[workflow].script.file.text.length === 0) {
						ui[workflow].script.file.helpTip = 'Select a script';
					} else {
						ui[workflow].script.file.helpTip = File(ui[workflow].script.path).exists
							? beautifyPath(File(ui[workflow].script.path))
							: 'File not found';
					}
				}

				if (ui[workflow].destination.isOn.value) {
					if (ui[workflow].destination.folder.text.length === 0) {
						ui[workflow].destination.folder.helpTip = 'Select a folder';
					} else {
						ui[workflow].destination.folder.helpTip = Folder(ui[workflow].destination.path).exists
							? beautifyPath(Folder(ui[workflow].destination.path))
							: 'Folder not found';
					}
				} else { // Using documents folders
					ui[workflow].destination.folder.helpTip = 'Using documents folders';
				}
			}

			// Update 'Start' button

			// If in batch folder mode, it must be valid
			if (isFolderMode) {
				if (ui.input.source.folder.text.length === 0) {
					ui.text
						= ui.actions.ok.helpTip
						= 'Select a source folder';
					ui.actions.ok.enabled = false;
					return;
				} else if (!Folder(ui.input.source.path).exists) {
					ui.text
						= ui.actions.ok.helpTip
						= 'Error: Source folder not found';
					ui.actions.ok.enabled = false;
					return;
				}
			}

			// At least a preset must be selected
			if (!ui.workflow1.isOn.value && !ui.workflow2.isOn.value) {
				ui.text
					= ui.actions.ok.helpTip
					= 'Select a workflow';
				ui.actions.ok.enabled = false;
				return;
			}

			for (i = 1; i <= 2; i++) {
				workflow = 'workflow' + i;

				// If running a script, it must be valid
				if (ui[workflow].isOn.value && ui[workflow].script.isOn.value) {
					if (ui[workflow].script.file.text.length === 0) {
						ui.actions.ok.helpTip
							= ui.text
							= workflow.replace('workflow', 'Workflow #')
								+ ': Select a script';
						ui.actions.ok.enabled = false;
						return;
					} else if (!File(ui[workflow].script.path).exists) {
						ui.actions.ok.helpTip
							= ui.text
							= 'Error: '
								+ workflow.replace('workflow', 'Workflow #')
								+ ': Script not found';
						ui.actions.ok.enabled = false;
						return;
					}
				}

				// If exporting in a custom output folder, it must be valid
				if (ui[workflow].isOn.value && ui[workflow].destination.isOn.value) {
					if (ui[workflow].destination.folder.text.length === 0) {
						ui.actions.ok.helpTip
							= ui.text
							= workflow.replace('workflow', 'Workflow #')
								+ ': Select an output folder';
						ui.actions.ok.enabled = false;
						return;
					} else if (!Folder(ui[workflow].destination.path).exists) {
						ui.actions.ok.helpTip
							= ui.text
							= 'Error: '
								+ workflow.replace('workflow', 'Workflow #')
								+ ': Output folder not found';
						ui.actions.ok.enabled = false;
						return;
					}
				}
			}
		}
	}

	function getFileName(/*string*/fn) {
		return (/\./g.test(fn) && fn.slice(0, fn.lastIndexOf('.'))) || fn;
	}

	function beautifyPath(/*File|Folder*/f) {
		return WIN
			? decodeURI(f.fsName)
			: decodeURI(f.fullName);
	}

	function zeroPad(/*number*/number, /*number*/digits) {
		number = number.toString();
		while (number.length < digits) number = '0' + number;
		return number;
	}

	function cleanup() {
		app.scriptPreferences.measurementUnit = old.measurementUnit;
		app.scriptPreferences.userInteractionLevel = old.userInteractionLevel;
		app.pdfExportPreferences.viewPDF = old.viewPDF;
		try { progressBar.close(); } catch (e) {}
	}
}
