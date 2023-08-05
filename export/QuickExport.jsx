/*
	Quick export 23.8.5
	(c) 2021-2023 Paul Chiorean <jpeg@basement.ro>

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

// @includepath '.;./lib;../lib';
// @include 'getFilesRecursively.jsxinc';
// @include 'isInArray.jsxinc';
// @include 'naturalSorter.jsxinc';
// @include 'progressBar.jsxinc';
// @include 'report.jsxinc';

app.doScript(QuickExport, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'QuickExport');

function QuickExport() {
	var doc, settings, ui, progressBar;
	var errors = [];
	var title = 'Quick Export';
	var ADV = ScriptUI.environment.keyboardState.altKey;
	var WIN = (File.fs === 'Windows');
	var invalidFilenameChars = /[<>:"\/\\|?*]/g; // https://gist.github.com/doctaphred/d01d05291546186941e1b7ddc02034d3
	var regexTokensRE = /[|^$(.)[\]{*+?}\\]/g;
	var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());
	var settingsFile = File(Folder.userData + '/' + script.name.replace(/.[^.]+$/, '') + '.prefs');
	var old = {
		measurementUnit: app.scriptPreferences.measurementUnit,
		userInteractionLevel: app.scriptPreferences.userInteractionLevel,
		viewPDF: app.pdfExportPreferences.viewPDF,
		destination: {}
	};
	var isFolderMode = (app.documents.length === 0);
	var MMDD = zeroPad((new Date()).getMonth() + 1, 2) +
		'.' + zeroPad((new Date()).getDate(), 2);

	var VER = '3.8';
	var defaults = {
		workflow1: {
			active: true,
			label: 'Preview',
			presetName: '_preview',
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
				suffix: { active: true, value: ''},
				sortBySuffix: true,
				sortByDate: false,
				split: false,
				overwrite: false,
				docSave: { active: true, scope: [ true, false ], saveAs: false }
			}
		},
		workflow2: {
			active: false,
			label: 'Print',
			presetName: '_print',
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
				suffix: { active: true, value: ''},
				sortBySuffix: true,
				sortByDate: false,
				split: false,
				overwrite: false,
				docSave: { active: true, scope: [ true, false ], saveAs: false }
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

	app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALERTS;
	app.pdfExportPreferences.viewPDF = false;

	if (showDialog() === 1) main();
	cleanup();
	exit();

	function main() {
		var name, maxCounter, exp, suffix, layer, baseFolder, destFolder, subSuffix, subDate;
		var names = [];
		var docs = [];
		var layersState = [];
		var pbWidth = 50;

		app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

		// Get documents list
		if (isFolderMode) {
			docs = ui.input.options.subfolders.value
				? getFilesRecursively(ui.input.source.path, true, 'indd').sort(naturalSorter)
				: ui.input.source.path.getFiles('*.indd').sort(naturalSorter);
			if (docs.length === 0) { alert('No InDesign documents found.'); cleanup(); }
		} else {
			docs = app.documents.everyItem().getElements();
			while ((doc = docs.shift())) try { names.push(doc.fullName); } catch (e) { names.push(doc.name); }
			names.sort(naturalSorter);
			docs = [];
			while ((name = names.shift())) docs.push(app.documents.itemByName(name));
		}

		// Init progress bar
		maxCounter = docs.length * ((ui.workflow1.isOn.value ? 1 : 0) + (ui.workflow2.isOn.value ? 1 : 0));
		for (i = 0, n = docs.length; i < n; i++) pbWidth = Math.max(pbWidth, decodeURI(docs[i].name).length);
		progressBar = new ProgressBar('Exporting', maxCounter, pbWidth + 10);

		// Documents loop
		while ((doc = docs.shift())) {
			// Open docs (optionally upgrade from old versions)
			if (isFolderMode) {
				if (doc.exists) {
					doc = app.open(doc);
				} else {
					errors.push(decodeURI(doc) + ': [ERR] Not found; skipped.');
					continue;
				}
				if (doc.converted) {
					if (ui.actions.updateVersion.value) {
						doc.save(File(doc.filePath + '/' + doc.name));
						errors.push(decodeURI(doc.name) + ': [INFO] Converted from old version.');
					} else {
						errors.push(decodeURI(doc.name) + ': [ERR] Must be converted; skipped.');
						doc.close(SaveOptions.NO);
						continue;
					}
				}
			} else {
				app.activeDocument = doc;
				if (doc.converted) {
					if (ui.actions.updateVersion.value) {
						doc.save(File(doc.filePath + '/' + doc.name));
						errors.push(decodeURI(doc.name) + ': [INFO] Converted from old version.');
					} else {
						errors.push(decodeURI(doc.name) + ': [ERR] Must be converted; skipped.');
						continue;
					}
				}
				if (!doc.saved) {
					errors.push(decodeURI(doc.name) + ': [ERR] Is not saved; skipped.');
					continue;
				}
			}

			// Set measurement units
			old.horizontalMeasurementUnits = doc.viewPreferences.horizontalMeasurementUnits;
			old.verticalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits;
			doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
			doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;

			checkFonts();
			checkTextOverflow();

			// Workflows loop
			old.docSpreads = doc.spreads.length; // Save initial spreads count for 'asPairs' (see 'exportDoc()')
			for (var step = 1; step < 3; step++) {
				exp = ui['workflow' + step]; // Current workflow
				if (!exp.isOn.value) continue;

				saveLayersState();

				// Update links
				if (exp.updateLinks.value) updateLinks();

				// Get base folder
				baseFolder = decodeURI(doc.filePath);
				if (exp.destination.isOn.value) {
					baseFolder =
						WIN ? decodeURI(exp.destination.path.fsName) : decodeURI(exp.destination.path.fullName);
				}

				// Get suffix
				suffix = '';
				if (exp.suffix.isOn.value) suffix = exp.suffix.et.text ? ('_' + exp.suffix.et.text) : '';

				// Create subfolders
				destFolder = baseFolder;
				subSuffix = '';
				subDate = '';
				if (exp.sortBySuffix.value && suffix) {
					subSuffix = suffix.replace(/^_/, '').replace(/\+.*$/, '').replace(/^\s+|\s+$/g, '');
					destFolder = baseFolder + '/' + subSuffix;
					if (!Folder(destFolder).exists) Folder(destFolder).create();
				}
				if (exp.sortByDate.value) {
					subDate = MMDD;
					if (!Folder(destFolder + '/' + subDate).exists) Folder(destFolder + '/' + subDate).create();
				}

				// Run script
				if (exp.script.isOn.value) {
					runScript(exp.script.path);
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

				// Hack: Append special folder names to the suffix
				if (exp.suffix.isOn.value && /^_print/i.test(suffix)) {
					if (((layer = doc.layers.itemByName('dielines')).isValid
						|| (layer = doc.layers.itemByName('diecut')).isValid
						|| (layer = doc.layers.itemByName('die cut')).isValid)
						&& layer.visible
						&& layer.printable
					) suffix += '+diecut';
					if ((layer = doc.layers.itemByName('white')).isValid
						&& layer.visible
						&& layer.printable
					) suffix += '+white';
					if ((layer = doc.layers.itemByName('foil')).isValid
						&& layer.visible
						&& layer.printable
					) suffix += '+foil';
					if ((layer = doc.layers.itemByName('varnish')).isValid
						&& layer.visible
						&& layer.printable
					) suffix += '+varnish';
				}

				doExport(exp.asSpreads.value, exp.split.value, exp.preset.selection.text);

				restoreLayersState();

				// Restore measurement units
				doc.viewPreferences.horizontalMeasurementUnits = old.horizontalMeasurementUnits;
				doc.viewPreferences.verticalMeasurementUnits = old.verticalMeasurementUnits;

				// Update documents
				if (exp.docSave.isOn.value) {
					if (exp.docSave.scope.mod.value) {
						if (doc.modified) {
							doc.save(exp.saveAs.enabled && exp.saveAs.value ?
								File(doc.fullName) : undefined);
						}
					} else {
						doc.save(File(doc.fullName));
					}
				}
			}

			// Close document
			if (isFolderMode) doc.close(SaveOptions.NO);
			else if (ui.actions.docClose.value) doc.close(SaveOptions.NO);
		}

		function checkFonts() {
			var usedFonts = doc.fonts.everyItem().getElements();
			for (var i = 0, n = usedFonts.length; i < n; i++) {
				if (usedFonts[i].status !== FontStatus.INSTALLED) {
					errors.push(decodeURI(doc.name) + ": [ERR] Font '" + usedFonts[i].name.replace(/\t/g, ' ') + "' is " +
						String(usedFonts[i].status).toLowerCase().replace(/_/g, ' '));
				}
			}
		}

		function checkTextOverflow() {
			var frm;
			var frms = doc.allPageItems;
			while ((frm = frms.shift())) {
				if (frm.constructor.name !== 'TextFrame') continue;
				if (frm.overflows && frm.parentPage) {
					errors.push(decodeURI(doc.name) + ': [ERR] Text overflows.');
					return;
				}
			}
		}

		function updateLinks() {
			for (var i = 0, n = doc.links.length; i < n; i++) {
				if (!doc.links[i].parent.parent.parentPage) continue;
				switch (doc.links[i].status) {
					case LinkStatus.LINK_OUT_OF_DATE:
						doc.links[i].update();
						break;
					case LinkStatus.LINK_MISSING:
					case LinkStatus.LINK_INACCESSIBLE:
						errors.push(decodeURI(doc.name) + ": [ERR] Link '" + doc.links[i].name + "' not found.");
						break;
				}
			}
		}

		function runScript(/*File*/scriptPath) {
			try {
				app.doScript(scriptPath,
					getScriptLanguage(scriptPath.fsName.replace(/^.*\./, '')),
					undefined,
					UndoModes.ENTIRE_SCRIPT, 'Run script'
				);
			} catch (e) {
				errors.push(decodeURI(doc.name) + ': [ERR] Script returned "' +
					e.toString().replace(/\r|\n/g, '\u00B6') + '" (line: ' + e.line + ')');
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

			if (split && !isCombo) { // Export separate pages
				// Note: if a script doubles the number of pages/spreads, we'll exports pairs
				asPairs = (doc.spreads.length === old.docSpreads * 2) && asSpreads;
				fileSufx = RegExp('([ ._-])([a-zA-Z]{' +
					(asPairs ? scope.length / 2 : scope.length) + '})$', 'i').exec(baseName);
				progressBar.update();
				progressBar.init2(scope.length);

				for (var i = 0, n = scope.length; i < n; i++) {
					// Add a page/spread index
					destination = baseName;
					if (fileSufx) { // Already has an index
						destination = destination.replace(RegExp(fileSufx[0] + '$'), '') +
							fileSufx[1] + fileSufx[2][asPairs && !(i % 2) ? i / 2 : i];
					} else if (scope.length > 1) { // Add index only if needed
						destination += '_' + zeroPad(asPairs && !(i % 2) ? i / 2 + 1 : i + 1, String(n).length);
					}
					// Get a unique file path for export
					destination = getUniquePath(destination + suffix);
					// Get page range
					if (asSpreads) { // Export as spreads
						range = String(scope[i].pages[0].documentOffset + 1) + '-' +
							String(scope[asPairs ? i + 1 : i].pages[-1].documentOffset + 1);
						if (asPairs && !(i % 2)) i++;
					} else { // Export as pages
						range = String(scope[i].documentOffset + 1);
					}
					progressBar.update2();
					progressBar.msg(baseFolder === decodeURI(doc.filePath) ?
						decodeURI(File(destination).name) :
						destination);
					exportToPDF(destination, range, app.pdfExportPresets.item(preset));
				}
			} else { // Export all pages
				destination = getUniquePath(baseName + suffix);
				progressBar.update();
				progressBar.msg(baseFolder === decodeURI(doc.filePath) ?
					decodeURI(File(destination).name) :
					destination);
				exportToPDF(destination, PageRange.ALL_PAGES, app.pdfExportPresets.item(preset));
			}

			function getUniquePath(/*string*/filename) {
				var pdfFiles, fileIndex, fileLastIndex, fileNextIndex, unique;
				var fileIndexRE = RegExp('^'
					+ filename.replace(regexTokensRE, '\\$&') // Escape regex tokens
					+ '(?:[ _-]*)' // Separator
					+ '(\\d+)?'    // Previous index
					+ '(?:.*)$');  // Extra stuff

				// Get a list of existing PDFs
				pdfFiles = getFilesRecursively(Folder(baseFolder), true, 'pdf');
				if (pdfFiles.length > 0) pdfFiles = pdfFiles.sort(naturalSorter);

				// Get the last index
				fileLastIndex = 0;
				for (var i = 0, n = pdfFiles.length; i < n; i++) {
					fileIndex = fileIndexRE.exec(decodeURI(pdfFiles[i].name).replace(/\.pdf$/i, ''));
					if (fileIndex)
						fileLastIndex = Math.max(fileLastIndex, isNaN(fileIndex[1]) ? 1 : Number(fileIndex[1]));
				}

				// Get the next index
				fileNextIndex = exp.overwrite.value ? fileLastIndex : fileLastIndex + 1;
				fileNextIndex = (fileNextIndex === 0 || fileNextIndex === 1) ? '' : String(fileNextIndex);

				unique = destFolder
					+ (exp.sortByDate.value ? '/' + subDate : '')
					+ '/' + filename
					+ (!suffix && fileNextIndex ? ' ' : '')
					+ fileNextIndex
					+ '.pdf';

				return unique;
			}

			function exportToPDF(/*string*/filename, /*string|Enum*/pageRange, /*pdfExportPreset*/pdfPreset) {
				if (ScriptUI.environment.keyboardState.keyName === 'Escape') cleanup();
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
					app.pdfExportPreferences.bleedTop =
					app.pdfExportPreferences.bleedBottom =
					app.pdfExportPreferences.bleedInside =
					app.pdfExportPreferences.bleedOutside = Number(exp.customBleed.et.text);
					app.pdfExportPreferences.pageMarksOffset =
						Math.min(app.pdfExportPreferences.bleedTop + 1, UnitValue('72 pt').as('mm'));
				}

				// Hack: omit printer's marks if bleed is zero --
				// if (doc.documentPreferences.documentBleedTopOffset +
				// 	doc.documentPreferences.documentBleedInsideOrLeftOffset +
				// 	doc.documentPreferences.documentBleedBottomOffset +
				// 	doc.documentPreferences.documentBleedOutsideOrRightOffset === 0 &&
				// 	!app.pdfExportPreferences.includeSlugWithPDF) { // -- but not if user wants slug
				// 	app.pdfExportPreferences.cropMarks = false;
				// 	app.pdfExportPreferences.pageInformationMarks = false;
				// }

				// Hack: don't include page information on pages with very small widths
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
				ui[workflow].suffix = ui[workflow].container.add('group { orientation: "row", margins: [ 0, -5, 0, 0 ] }');
					ui[workflow].suffix.isOn = ui[workflow].suffix.add('checkbox { text: "Add a suffix:", alignment: "bottom", preferredSize: [ 125, -1 ] }');
					ui[workflow].suffix.isOn.helpTip = 'Append a suffix to the exported file name';
					ui[workflow].suffix.et = ui[workflow].suffix.add('edittext { preferredSize: [ 159, 24 ] }');
					ui[workflow].suffix.et.helpTip = 'Append this text to the exported file name';
				ui[workflow].sortBySuffix = ui[workflow].container.add('checkbox { text: "Sort files into subfolders by suffix" }');
				ui[workflow].sortBySuffix.helpTip = 'Use the suffix field as the destination subfolder.\nNote: everything after a \'+\' is ignored (e.g., files with\na \'print+diecut\' suffix will be exported to \'print\')';
				ui[workflow].sortByDate = ui[workflow].container.add('checkbox { text: "Sort files into subfolders by date" }');
				ui[workflow].sortByDate.helpTip = 'Sort in subfolders with the current date (\'MM.DD\')';
				ui[workflow].split = ui[workflow].container.add('checkbox { text: "Export as separate pages/spreads" }');
				ui[workflow].overwrite = ui[workflow].container.add('checkbox { text: "Overwrite existing files" }');

				// Updating source
				ui[workflow].container.add('panel { alignment: "fill" }');
				ui[workflow].docSave = ui[workflow].container.add('group { orientation: "row" }');
					ui[workflow].docSave.isOn = ui[workflow].docSave.add('checkbox { text: "Save:" }');
					ui[workflow].docSave.scope = ui[workflow].docSave.add('group { margins: [ 0, -1, 0, 0 ] }');
						ui[workflow].docSave.scope.mod = ui[workflow].docSave.scope.add('radiobutton { text: "modified" }');
						ui[workflow].docSave.scope.mod.value = true;
						ui[workflow].docSave.scope.all = ui[workflow].docSave.scope.add('radiobutton { text: "all documents" }');
				ui[workflow].saveAs = ui[workflow].container.add('checkbox { text: "Use \'Save as\u2026\' to reduce documents size" }');
			},
			events: function (workflow) {
				ui[workflow].isOn.onClick = function () {
					ui[workflow].container.enabled = this.value;
					ui[workflow].label.enabled = this.value;

					ui[workflow].customDPI.isOn.onClick();
					ui[workflow].customBleed.isOn.onClick();
					ui[workflow].skipDNP.isOn.onClick();
					ui[workflow].suffix.isOn.onClick();
					ui[workflow].script.isOn.onClick();
					ui[workflow].destination.isOn.onClick();
					ui[workflow].docSave.isOn.onClick();
					ui[workflow].saveAs.onClick();
				};

				ui[workflow].preset.onChange = function () {
					var str = this.selection.text;
					var pdfExpPreset = app.pdfExportPresets.item(str);

					ui[workflow].cropMarks.value = pdfExpPreset.cropMarks;
					ui[workflow].pageInfo.value = pdfExpPreset.pageInformationMarks;
					ui[workflow].slugArea.value = pdfExpPreset.includeSlugWithPDF;
					ui[workflow].asSpreads.value = pdfExpPreset.exportReaderSpreads;

					ui[workflow].exportLayers.value = pdfExpPreset.exportLayers;
					ui[workflow].exportLayers.enabled =
						Number(String(pdfExpPreset.acrobatCompatibility).replace('ACROBAT_', '')) >= 6;

					ui[workflow].customDPI.isOn.value = false;
					ui[workflow].customDPI.isOn.enabled = !(pdfExpPreset.colorBitmapSampling === Sampling.NONE);
					ui[workflow].customDPI.isOn.onClick();

					if (pdfExpPreset.useDocumentBleedWithPDF) {
						ui[workflow].customBleed.isOn.value = false;
						ui[workflow].customBleed.isOn.onClick();
					} else {
						ui[workflow].customBleed.isOn.value = true;
						ui[workflow].customBleed.isOn.onClick();
						ui[workflow].customBleed.et.text =
							Math.max(pdfExpPreset.bleedTop, pdfExpPreset.bleedInside,
							pdfExpPreset.bleedBottom, pdfExpPreset.bleedOutside).toFixed(2)
								.replace(/\.?0+$/, '');
					}

					ui[workflow].suffix.et.text = /_/g.test(str) ? str.replace(/^.*_/, '') : '';
					ui[workflow].suffix.isOn.onClick();

					this.helpTip = (function (/*pdfExportPreset*/preset) {
						var msg = [];

						msg.push('Profile: ' +
							(preset.pdfDestinationProfile.constructor.name === 'String'
								? preset.effectivePDFDestinationProfile
								: String(preset.pdfDestinationProfile).toLowerCase()
									.replace(/_/g, ' ')
									.replace('use ', '')
							)
						);

						if (preset.standardsCompliance !== PDFXStandards.NONE) {
							msg.push('Standard: ' +
								String(preset.standardsCompliance).toLowerCase()
									.replace(/^(pdfx)(.+?)(\d{4})(_standard)$/, 'PDF/X-$2:$3')
							);
						}

						msg.push('Compatibility: Acrobat ' +
							(function (str) {
								return {
									4: '4 (PDF 1.3)',
									5: '5 (PDF 1.4)',
									6: '6 (PDF 1.5)',
									7: '7 (PDF 1.6)',
									8: '8/9 (PDF 1.7)'
								}[str] || str;
							}(String(preset.acrobatCompatibility).replace('ACROBAT_', '')))
						);

						msg.push('Color space: ' +
							String(preset.pdfColorSpace).toLowerCase()
								.replace(/_/g, ' ')
								.replace(' color space', '')
								.replace('rgb', 'RGB')
								.replace('cmyk', 'CMYK')
						);

						if (preset.colorBitmapSampling === Sampling.NONE) {
							msg.push('Sampling: none');
						} else {
							msg.push('Sampling: ' + String(preset.colorBitmapSampling).toLowerCase()
								.replace(/_/g, ' '));
							msg.push('Resolution: ' + preset.colorBitmapSamplingDPI + ' dpi');
						}

						msg.push('Compression: ' +
							String(preset.colorBitmapCompression).toLowerCase()
								.replace(/_/g, ' ')
								.replace(' compression', '')
						);
						if (preset.colorBitmapCompression !== BitmapCompression.NONE
								&& preset.colorBitmapCompression !== BitmapCompression.ZIP) {
							msg.push('Quality: ' + String(preset.colorBitmapQuality).toLowerCase()
								.replace(/_/g, ' '));
						}

						msg.push('\nExport as ' + (preset.exportReaderSpreads ? 'spreads' : 'pages'));

						if (preset.useDocumentBleedWithPDF) {
							msg.push('Use document bleed');
						} else {
							msg.push('Use custom bleed: ' +
								Math.max(preset.bleedTop, preset.bleedInside, preset.bleedBottom, preset.bleedOutside)
									.toFixed(2)
									.replace(/\.?0+$/, '') + ' mm'
							);
						}

						if (preset.cropMarks
								|| preset.pageInformationMarks
								|| preset.includeSlugWithPDF
								|| preset.exportLayers) {
							msg.push('Include ' +
								((preset.cropMarks ? 'crop marks, ' : '') +
								(preset.pageInformationMarks ? 'page info, ' : '') +
								(preset.includeSlugWithPDF ? 'slug area, ' : '') +
								(preset.exportLayers ? 'layers, ' : ''))
									.replace(/, $/, '')
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
						this.parent.et.helpTip = 'Enter a number between 9 and 2400 (dpi)';
						this.parent.et.onDeactivate();
					} else {
						this.parent.et.text = pdfExpPreset.colorBitmapSamplingDPI;
						this.parent.et.helpTip = 'Using profile resolution';
					}
				};

				ui[workflow].customDPI.et.onDeactivate = function () {
					this.text = Number(this.text.replace(/[^\d.,]/gi, '').replace(',', '.'));
					if (isNaN(this.text) || this.text < 9 || this.text > 2400) {
						this.parent.isOn.value = false;
						this.parent.isOn.onClick();
					}
				};

				ui[workflow].customBleed.isOn.onClick = function () {
					this.parent.et.enabled = this.value;
					if (this.parent.et.enabled) {
						this.parent.et.helpTip = 'Enter a value between 0 and 152.4 (mm)';
						this.parent.et.onDeactivate();
					} else {
						this.parent.et.text = '';
						this.parent.et.helpTip = 'Using documend bleed';
					}
				};

				ui[workflow].customBleed.et.onDeactivate = function () {
					if (this.text === '') this.text = '0';
					this.text = Number(this.text.replace(/[^\d.,]/gi, '').replace(',', '.'));
					if (isNaN(this.text) || UnitValue(this.text, 'mm').as('pt') > 432.0001) {
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
						w.actions.ok = w.actions.add('button { text: "Ok", preferredSize: [ 80, 24 ] }');

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
					if (this.parent.path && decodeURI(this.parent.path.name) === this.text) return;
					var newFile = File(this.text);
					if (newFile.exists
						&& (WIN ? /\.(jsx*(bin)*)$/i.test(newFile) : /\.(jsx*(bin)*|scpt)$/i.test(newFile))) {
						this.parent.path = newFile;
						this.text = decodeURI(newFile.name);
						this.helpTip = WIN ? decodeURI(newFile.fsName) : decodeURI(newFile.fullName);
					} else {
						this.parent.path = false;
					}
					updateStatus();
				};

				ui[workflow].script.file.onActivate = function () {
					if (this.parent.path) this.text = decodeURI(this.parent.path);
				};

				ui[workflow].script.file.onDeactivate = function () {
					this.onChange();
				};

				ui[workflow].destination.isOn.onClick = function () {
					this.parent.parent.folder.enabled =
					this.parent.parent.browse.enabled = this.value;
					this.parent.parent.folder.onChange();
				};

				ui[workflow].destination.browse.onClick = function () {
					var ff = Folder.selectDialog('Select a folder:');
					if (ff != null) this.parent.parent.folder.text = ff;
					this.parent.parent.folder.onChange();
				};

				ui[workflow].destination.folder.onChange = function () {
					if (this.parent.path && decodeURI(this.parent.path.name) === this.text) {
						updateStatus();
						return;
					}

					if (this.enabled && this.text === 'Using documents folders') {
						this.text = old.destination[workflow]
							? old.destination[workflow]
							: settings[workflow].outputOptions.destination.value;
					}

					var newFolder = Folder(this.text);
					if (newFolder.exists) {
						this.parent.path = newFolder;
						this.text = decodeURI(newFolder.name);
						this.helpTip = WIN ? decodeURI(newFolder.fsName) : decodeURI(newFolder.fullName);
					} else {
						this.parent.path = false;
					}
					updateStatus();
				};

				ui[workflow].destination.folder.onActivate = function () {
					if (this.parent.path) this.text = decodeURI(this.parent.path);
				};

				ui[workflow].destination.folder.onDeactivate = function () {
					this.onChange();
				};

				ui[workflow].suffix.isOn.onClick = function () {
					this.parent.et.enabled = this.value;
					this.parent.parent.parent.sortBySuffix.enabled = this.value && this.parent.et.text.length > 0;
					this.parent.et.onChange();
				};

				ui[workflow].suffix.et.onChange = function () {
					var str = this.text
						.replace(/^\s+|\s+$/g, '')
						.replace(invalidFilenameChars, '')
						.replace(/^_/, '');
					if (this.text !== str) this.text = str;
					this.parent.parent.parent.sortBySuffix.enabled = (this.text.length > 0);
				};

				ui[workflow].suffix.et.onDeactivate = function () {
					this.onChange();
				};

				ui[workflow].docSave.isOn.onClick = function () {
					this.parent.scope.enabled = this.value;
					this.parent.parent.parent.saveAs.enabled = this.value;
				};

				ui[workflow].docSave.scope.all.onClick = function () {
					this.parent.parent.parent.parent.saveAs.value = this.value;
				};

				ui[workflow].saveAs.onClick = function () {
					if (!this.value) this.parent.parent.docSave.scope.mod.value = true;
				};
			}
		};
		var prefs = {
			read: function () {
				try { settings = $.evalFile(settingsFile); } catch (e) { this.reset(); }
				if (settings.version === undefined || settings.version !== VER) this.reset();

				for (var i = 1, workflow; i <= 2; i++) {
					workflow = 'workflow' + i;
					ui[workflow].isOn.value = settings[workflow].active;
					ui[workflow].label.text = settings[workflow].label;
					ui[workflow].preset.selection =
						findPresetIndex(settings[workflow].presetName, ui[workflow].preset.items);
					ui[workflow].cropMarks.value = settings[workflow].presetOptions.cropMarks;
					ui[workflow].pageInfo.value = settings[workflow].presetOptions.pageInfo;
					ui[workflow].slugArea.value = settings[workflow].presetOptions.slugArea;
					ui[workflow].asSpreads.value = settings[workflow].presetOptions.asSpreads;
					ui[workflow].customDPI.isOn.value = settings[workflow].presetOptions.customDPI.active;
					ui[workflow].customDPI.et.text = settings[workflow].presetOptions.customDPI.value;
					ui[workflow].customBleed.isOn.value = settings[workflow].presetOptions.customBleed.active;
					ui[workflow].customBleed.et.text = settings[workflow].presetOptions.customBleed.value;
					ui[workflow].exportLayers.value = settings[workflow].presetOptions.exportLayers;
					ui[workflow].updateLinks.value = settings[workflow].docActions.updateLinks;
					ui[workflow].skipDNP.isOn.value = settings[workflow].docActions.skipDNP;
					ui[workflow].script.file.text = settings[workflow].docActions.script.value;
					ui[workflow].script.isOn.value = settings[workflow].docActions.script.active;
					ui[workflow].destination.folder.text = settings[workflow].outputOptions.destination.value;
					ui[workflow].destination.isOn.value = settings[workflow].outputOptions.destination.active;
					ui[workflow].suffix.et.text = settings[workflow].outputOptions.suffix.value;
					ui[workflow].suffix.isOn.value = settings[workflow].outputOptions.suffix.active;
					ui[workflow].sortBySuffix.value = settings[workflow].outputOptions.sortBySuffix;
					ui[workflow].sortByDate.value = settings[workflow].outputOptions.sortByDate;
					ui[workflow].split.value = settings[workflow].outputOptions.split;
					ui[workflow].overwrite.value = settings[workflow].outputOptions.overwrite;
					ui[workflow].docSave.isOn.value = settings[workflow].outputOptions.docSave.active;
					ui[workflow].docSave.scope.mod.value = settings[workflow].outputOptions.docSave.scope[0];
					ui[workflow].docSave.scope.all.value = settings[workflow].outputOptions.docSave.scope[1];
					ui[workflow].saveAs.value = settings[workflow].outputOptions.docSave.saveAs;
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
					settings[workflow].label = ui[workflow].label.text;
					settings[workflow].presetName = ui[workflow].preset.selection.text;
					settings[workflow].presetOptions = {
						cropMarks: ui[workflow].cropMarks.value,
						pageInfo: ui[workflow].pageInfo.value,
						slugArea: ui[workflow].slugArea.value,
						asSpreads: ui[workflow].asSpreads.value,
						customDPI: {
							active: ui[workflow].customDPI.isOn.value,
							value: ui[workflow].customDPI.et.text
						},
						customBleed: {
							active: ui[workflow].customBleed.isOn.value,
							value: ui[workflow].customBleed.et.text
						},
						exportLayers: ui[workflow].exportLayers.value
					};
					settings[workflow].docActions = {
						updateLinks: ui[workflow].updateLinks.value,
						skipDNP: ui[workflow].skipDNP.isOn.value,
						script: {
							active: ui[workflow].script.isOn.value,
							value: ui[workflow].script.path.exists
								? decodeURI(ui[workflow].script.path.fullName)
								: ''
						}
					};
					settings[workflow].outputOptions = {
						destination: {
							active: ui[workflow].destination.isOn.value,
							value: ui[workflow].destination.path.exists
								? decodeURI(ui[workflow].destination.path.fullName)
								: ''
						},
						suffix: {
							active: ui[workflow].suffix.isOn.value,
							value: ui[workflow].suffix.et.text
						},
						sortBySuffix: ui[workflow].sortBySuffix.value,
						sortByDate: ui[workflow].sortByDate.value,
						split: ui[workflow].split.value,
						overwrite: ui[workflow].overwrite.value,
						docSave: {
							active: ui[workflow].docSave.isOn.value,
							scope: [
								ui[workflow].docSave.scope.mod.value,
								ui[workflow].docSave.scope.all.value
							],
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
				try { settingsFile.remove(); } catch (e) {}
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
					ui.input.options.subfolders = ui.input.options.add('checkbox { text: "Include subfolders" }');
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

		// UI events

		// Input source
		if (isFolderMode) {
			ui.input.source.browse.onClick = function () {
				var ff = Folder.selectDialog('Select a folder:');
				if (ff != null) this.parent.folder.text = ff;
				this.parent.folder.onChange();
			};

			ui.input.source.folder.onChange = function () {
				var ff;
				if (Folder(this.text).exists) {
					this.parent.path = Folder(this.text);
					ff = WIN ? decodeURI(this.parent.path.fsName) : decodeURI(this.parent.path.fullName);
					this.text = ff;
				} else {
					this.parent.path = false;
				}
				updateStatus();
			};
		}

		// Workflows
		createWorkflowUI.events('workflow1');
		createWorkflowUI.events('workflow2');

		// Actions
		ui.actions.updateVersion.onClick = function () {
			if (this.value) {
				ui.workflow1.docSave.isOn.value = true;
				if (ui.workflow1.isOn) ui.workflow1.docSave.isOn.onClick();
				ui.workflow2.docSave.isOn.value = true;
				if (ui.workflow2.isOn) ui.workflow2.docSave.isOn.onClick();
			}
		};

		// Show / Close
		ui.onShow = function () {
			prefs.read();
			if (settings.position !== '') {
				try { ui.location = settings.position; } catch (e) {} // Use saved position
			} else if (app.windows.length > 0) { // Center in current window
				ui.frameLocation = [
					(app.activeWindow.bounds[1] + app.activeWindow.bounds[3] - ui.frameSize.width) / 2,
					app.activeWindow.bounds[0] +
						(app.activeWindow.bounds[0] + app.activeWindow.bounds[2] - ui.frameSize.height) / 2
				];
			}
			updateStatus();
		};

		ui.onClose = function () {
			if (!ScriptUI.environment.keyboardState.altKey) prefs.save();
		};

		return ui.show();

		function updateStatus() {
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
					ui.input.source.folder.helpTip = ui.input.source.path
						? (WIN ? decodeURI(ui.input.source.path.fsName) : decodeURI(ui.input.source.path.fullName))
						: 'Folder not found';
				}
			}

			for (i = 1; i <= 2; i++) {
				workflow = 'workflow' + i;

				if (ui[workflow].script.isOn.value) {
					if (ui[workflow].script.file.text.length === 0) {
						ui[workflow].script.file.helpTip = 'Select a script';
					} else {
						ui[workflow].script.file.helpTip = ui[workflow].script.path
							? (WIN ? decodeURI(ui[workflow].script.path.fsName)
								: decodeURI(ui[workflow].script.path.fullName))
							: 'File not found';
					}
				}

				if (ui[workflow].destination.isOn.value) {
					if (ui[workflow].destination.folder.text.length === 0) {
						// ui[workflow].destination.folder.text =
						ui[workflow].destination.folder.helpTip = 'Select a folder';
					} else {
						ui[workflow].destination.folder.helpTip = ui[workflow].destination.path
							? (WIN ? decodeURI(ui[workflow].destination.path.fsName)
								: decodeURI(ui[workflow].destination.path.fullName))
							: 'Folder not found';
					}
				} else { // Using documents folders
					if (ui[workflow].destination.path) old.destination[workflow] = ui[workflow].destination.path;
					ui[workflow].destination.folder.text =
					ui[workflow].destination.folder.helpTip = 'Using documents folders';
				}
			}

			// Update 'Start' button

			// If in batch folder mode, it must be valid
			if (isFolderMode) {
				if (ui.input.source.folder.text.length === 0) {
					ui.text = ui.actions.ok.helpTip = 'Select a source folder';
					ui.actions.ok.enabled = false;
					return;
				} else if (!ui.input.source.path) {
					ui.text = ui.actions.ok.helpTip = 'Error: Source folder not found';
					ui.actions.ok.enabled = false;
					return;
				}
			}

			// At least a preset must be selected
			if (!ui.workflow1.isOn.value && !ui.workflow2.isOn.value) {
				ui.text = ui.actions.ok.helpTip = 'Select a workflow';
				ui.actions.ok.enabled = false;
				return;
			}

			for (i = 1; i <= 2; i++) {
				workflow = 'workflow' + i;

				// If running a script, it must be valid
				if (ui[workflow].isOn.value && ui[workflow].script.isOn.value) {
					if (ui[workflow].script.file.text.length === 0) {
						ui.actions.ok.helpTip = ui.text =
							workflow.replace('workflow', 'Workflow #') + ': Select a script';
						ui.actions.ok.enabled = false;
						return;
					} else if (!ui[workflow].script.path) {
						ui.actions.ok.helpTip = ui.text =
							'Error: ' + workflow.replace('workflow', 'Workflow #') + ': Script not found';
						ui.actions.ok.enabled = false;
						return;
					}
				}

				// If exporting in a custom output folder, it must be valid
				if (ui[workflow].isOn.value && ui[workflow].destination.isOn.value) {
					if (ui[workflow].destination.folder.text.length === 0) {
						ui.actions.ok.helpTip = ui.text =
							workflow.replace('workflow', 'Workflow #') + ': Select an output folder';
						ui.actions.ok.enabled = false;
						return;
					} else if (!ui[workflow].destination.path) {
						ui.actions.ok.helpTip = ui.text =
							'Error: ' + workflow.replace('workflow', 'Workflow #') + ': Output folder not found';
						ui.actions.ok.enabled = false;
						return;
					}
				}
			}
		}
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
		if (errors.length > 0) report(errors, 'Errors', 'auto', true);
	}
}
