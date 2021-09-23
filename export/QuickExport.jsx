/*
	Quick export v2.11.3 (2021-09-23)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

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

/* eslint-disable max-statements-per-line, no-useless-escape */

// Initialisation

var doc, settings, baseFolder, subfolder, suffix, exp, name, progressBar, maxCounter;
var ADV = ScriptUI.environment.keyboardState.altKey;
var WIN = (File.fs === 'Windows');
var VER = '2';
var forbiddenFilenameCharsRE = /[#%^{}\\<>*?\/$!'":@`|=]/g;
var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());
var settingsFile = File(Folder.userData + '/' + script.name.slice(0, script.name.lastIndexOf('.')) + '.prefs');
var presets = app.pdfExportPresets.everyItem().name.sort();
var folderMode = (app.documents.length === 0);
var old = {
	measurementUnit:      app.scriptPreferences.measurementUnit,
	userInteractionLevel: app.scriptPreferences.userInteractionLevel,
	viewPDF:              app.pdfExportPreferences.viewPDF
};
var errors = [];
var names = [];
var docs = [];
var pbWidth = 50;
var counter = 1;

var defaults = {
	presets: {
		preset1: {
			active: true,
			name: '_preview',
			suffix: '_preview',
			options: {
				spreads: true,
				marks: { crop: true, info: false },
				bleed: { custom: false, value: '3' },
				slug: false
			},
			script: {
				active: false,
				file: ''
			}
		},
		preset2: {
			active: false,
			name: '_print',
			suffix: '_print',
			options: {
				spreads: false,
				marks: { crop: true, info: false },
				bleed: { custom: false, value: '3' },
				slug: false
			},
			script: {
				active: false,
				file: ''
			}
		}
	},
	output: {
		dest: {
			active: false,
			folder: ''
		},
		options: {
			subfolders: true,
			split: false,
			overwrite: false,
			updatelinks: true,
			save: true,
			close: true
		}
	},
	position: '',
	version: VER
};

app.scriptPreferences.measurementUnit      = MeasurementUnits.MILLIMETERS;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALERTS;
app.pdfExportPreferences.viewPDF           = false;

// User interface

var ui = new Window('dialog { alignChildren: "left", margins: 16, orientation: "column", spacing: 10, text: "Quick Export" }');
ui.main = ui.add('group { margins: 0, orientation: "column", preferredSize: [ 500, -1 ], spacing: 10 }');
// -- Input source
if (folderMode) {
	ui.input = ui.main.add('panel { alignChildren: "left", margins: [ 10, 15, 10, 10 ], orientation: "column", spacing: 10, text: "Input folder" }');
		ui.input.source = ui.input.add('group { margins: 0, orientation: "row", spacing: 10 }');
			ui.input.source.folder = ui.input.source.add('edittext { preferredSize: [ 368, 24 ], properties: { readonly: true } }');
			ui.input.source.browse = ui.input.source.add('button { preferredSize: [ 100, 24 ], text: "Browse" }');
		ui.input.options = ui.input.add('group { margins: 0, orientation: "row", spacing: 10 }');
			ui.input.options.subfolders = ui.input.options.add('checkbox { alignment: "bottom", text: "Include subfolders" }');
}
// -- Export options
ui.presets = ui.main.add('panel { alignChildren: "left", margins: [ 10, 15, 10, 10 ], orientation: "column", spacing: 10, text: "Export presets" }');
	ui.preset1 = ui.presets.add('group { margins: 0, orientation: "row", spacing: 10 }');
		ui.preset1.isOn = ui.preset1.add('checkbox { alignment: "bottom" }');
		ui.preset1.preset = ui.preset1.add('dropdownlist', undefined, presets);
		ui.preset1.preset.preferredSize = [ 290, 24 ];
		ui.preset1.add('statictext { justify: "right", preferredSize: [ 40, 24 ], text: "Suffix:" }');
		ui.preset1.suffix = ui.preset1.add('edittext { helpTip: "Append this to the exported file name. Autodetected for presets that end with \'_suffix\'.", preferredSize: [ 100, 24 ] }');
	ui.preset1.options = WIN ? ui.presets.add('group { spacing: 12 }') : ui.presets.add('group { spacing: 14 }');
		ui.preset1.exportSpreads = ui.preset1.options.add('checkbox { alignment: "bottom", helpTip: "Export as spreads", text: "Spreads" }');
		ui.preset1.cropMarks = ui.preset1.options.add('checkbox { alignment: "bottom", helpTip: "Include crop marks", text: "Crop marks" }');
		ui.preset1.pageInfo = ui.preset1.options.add('checkbox { alignment: "bottom", helpTip: "Include page information", text: "Page info" }');
		ui.preset1.slug = ui.preset1.options.add('checkbox { alignment: "bottom", helpTip: "Include slug area", text: "Slug" }');
		ui.preset1.bleedCustom = ui.preset1.options.add('checkbox { alignment: "bottom", helpTip: "Override document bleed settings", text: "Custom bleed:" }');
		ui.preset1.bleedValue = ui.preset1.options.add('edittext { characters: 4, justify: "center", helpTip: "Enter a value between 0 and 25.4 mm", preferredSize: [ -1, 24 ] }');
	ui.preset1.script = ui.presets.add('group');
		ui.preset1.script.add('statictext { preferredSize: [ 80, 24 ], helpTip: "Run a JavaScript or AppleScript before exporting", text: "Run a script:" }');
		ui.preset1.script.isOn = ui.preset1.script.add('checkbox { alignment: "bottom" }');
		ui.preset1.script.file = ui.preset1.script.add('edittext { preferredSize: [ 250, 24 ], properties: { readonly: true } }');
		ui.preset1.script.browse = ui.preset1.script.add('button { preferredSize: [ 100, 24 ], text: "Browse" }');
	ui.presets.add('panel { alignment: "fill" }');
	ui.preset2 = ui.presets.add('group { margins: 0, orientation: "row", spacing: 10 }');
		ui.preset2.isOn = ui.preset2.add('checkbox { alignment: "bottom" }');
		ui.preset2.preset = ui.preset2.add('dropdownlist', undefined, presets);
		ui.preset2.preset.preferredSize = [ 290, 24 ];
		ui.preset2.add('statictext { justify: "right", preferredSize: [ 40, 24 ], text: "Suffix:" }');
		ui.preset2.suffix = ui.preset2.add('edittext { helpTip: "Append this to the exported file name. Autodetected for presets that end with \'_suffix\'.", preferredSize: [ 100, 24 ] }');
	ui.preset2.options = WIN ? ui.presets.add('group { spacing: 12 }') : ui.presets.add('group { spacing: 14 }');
		ui.preset2.exportSpreads = ui.preset2.options.add('checkbox { alignment: "bottom", helpTip: "Export as spreads", text: "Spreads" }');
		ui.preset2.cropMarks = ui.preset2.options.add('checkbox { alignment: "bottom", helpTip: "Include crop marks", text: "Crop marks" }');
		ui.preset2.pageInfo = ui.preset2.options.add('checkbox { alignment: "bottom", helpTip: "Include page information", text: "Page info" }');
		ui.preset2.slug = ui.preset2.options.add('checkbox { alignment: "bottom", helpTip: "Include slug area", text: "Slug" }');
		ui.preset2.bleedCustom = ui.preset2.options.add('checkbox { alignment: "bottom", helpTip: "Override document bleed settings", text: "Custom bleed:" }');
		ui.preset2.bleedValue = ui.preset2.options.add('edittext { characters: 4, justify: "center", helpTip: "Enter a value between 0 and 25.4 mm", preferredSize: [ -1, 24 ] }');
	ui.preset2.script = ui.presets.add('group');
		ui.preset2.script.add('statictext { preferredSize: [ 80, 24 ], helpTip: "Run a JavaScript or AppleScript before exporting", text: "Run a script:" }');
		ui.preset2.script.isOn = ui.preset2.script.add('checkbox { alignment: "bottom" }');
		ui.preset2.script.file = ui.preset2.script.add('edittext { preferredSize: [ 250, 24 ], properties: { readonly: true } }');
		ui.preset2.script.browse = ui.preset2.script.add('button { preferredSize: [ 100, 24 ], text: "Browse" }');
// -- Output options
ui.output = ui.main.add('panel { alignChildren: "left", margins: [ 10, 15, 10, 10 ], orientation: "column", spacing: 10, text: "Output folder and options" }');
	ui.output.dest = ui.output.add('group { margins: 0, orientation: "row", spacing: 10 }');
		ui.output.dest.isOn = ui.output.dest.add('checkbox { alignment: "bottom" }');
		ui.output.dest.folder = ui.output.dest.add('edittext { preferredSize: [ 340, 24 ], properties: { readonly: true } }');
		ui.output.dest.browse = ui.output.dest.add('button { preferredSize: [ 100, 24 ], text: "Browse" }');
	ui.output.options = ui.output.add('group { alignChildren: "top", margins: [ 0, 5, 0, 0 ], orientation: "row", spacing: 0 }');
		ui.output.opt1 = ui.output.options.add('group { alignChildren: "left", margins: 0, orientation: "column", preferredSize: [ 200, -1 ], spacing: 5 }');
			ui.output.options.subfolders = ui.output.opt1.add('checkbox { helpTip: "Use \'suffix\' fields as subfolders", text: "Export in subfolders" }');
			ui.output.options.split = ui.output.opt1.add('checkbox { text: "Export separate pages" }');
			ui.output.options.overwrite = ui.output.opt1.add('checkbox { text: "Overwrite existing files" }');
		ui.output.opt2 = ui.output.options.add('group { alignChildren: "left", orientation: "column", margins: 0, spacing: 5 }');
			ui.output.options.updateLinks = ui.output.opt2.add('checkbox { text: "Update links" }');
			ui.output.options.docSave = ui.output.opt2.add('checkbox { text: "Save exported documents" }');
			ui.output.options.docClose = ui.output.opt2.add('checkbox { text: "Close exported documents" }');
			ui.output.options.docClose.enabled = !folderMode;
// -- Actions
ui.actions = ui.add('group { orientation: "row" }');
if (ADV) {
	ui.actions.savePrefs = ui.actions.add('button { preferredSize: [ 80, -1 ], text: "Save prefs" }');
	ui.actions.resetPrefs = ui.actions.add('button { preferredSize: [ 80, -1 ], text: "Reset prefs" }');
	ui.actions.add('group { preferredSize: [ 140, -1 ] }');
} else {
	ui.actions.savePrefs = ui.actions.add('checkbox { preferredSize: [ 320, -1 ], text: "Save preferences" }');
	ui.actions.savePrefs.value = true;
}
ui.actions.add('button { preferredSize: [ 80, -1 ], properties: { name: "cancel" }, text: "Cancel" }');
ui.actions.ok = ui.actions.add('button { preferredSize: [ 80, -1 ], properties: { name: "ok" }, text: "Start" }');

// UI callback functions

ui.preset1.isOn.onClick = function () {
	ui.preset1.preset.enabled = ui.preset1.suffix.enabled = this.value;
	ui.preset1.options.enabled = this.value;
	ui.preset1.script.enabled = this.value;
	ui.preset1.bleedCustom.onClick();
	ui.preset1.script.isOn.onClick();
	if (folderMode) ui.actions.ok.enabled = (this.value || ui.preset2.isOn.value) && !!ui.input.source.path;
	else ui.actions.ok.enabled = (this.value || ui.preset2.isOn.value);
};
ui.preset1.bleedCustom.onClick = function () {
	ui.preset1.bleedValue.enabled = this.value;
	if (ui.preset1.bleedValue.enabled) ui.preset1.bleedValue.onChanging();
};
ui.preset1.script.isOn.onClick = function () {
	ui.preset1.script.file.enabled = ui.preset1.script.browse.enabled = this.value;
};
ui.preset1.script.browse.onClick = function () {
	var f;
	var newFile = File.openDialog('Select a script:');
	if (newFile == null && !ui.preset1.script.path) ui.preset1.script.isOn.notify();
	if (newFile.exists && (WIN ? /\.(jsx*(bin)*)$/i.test(newFile) : /\.(jsx*(bin)*|scpt)$/i.test(newFile))) {
		f = WIN ? decodeURI(newFile.fsName) : decodeURI(newFile.fullName);
		ui.preset1.script.path = newFile;
		ui.preset1.script.file.text = decodeURI(newFile.name);
		ui.preset1.script.file.helpTip = f;
	} else {
		alert('Please select a JavaScript' + (WIN ? '' : ' or AppleScript') + ' file.');
		this.notify();
	}
};
ui.preset1.preset.onChange = function () {
	// Auto-set suffix
	var str = this.selection.text;
	var pdfExpPreset = app.pdfExportPresets.item(str);
	ui.preset1.suffix.text = (/_/g.test(str) && str.slice(str.lastIndexOf('_'))) || '';
	// Populate preset options
	ui.preset1.exportSpreads.value = pdfExpPreset.exportReaderSpreads;
	ui.preset1.cropMarks.value = pdfExpPreset.cropMarks;
	ui.preset1.pageInfo.value = pdfExpPreset.pageInformationMarks;
	ui.preset1.slug.value = pdfExpPreset.includeSlugWithPDF;
	ui.preset1.bleedValue.text = Math.round(pdfExpPreset.pageMarksOffset);
};
ui.preset2.isOn.onClick = function () {
	ui.preset2.preset.enabled = ui.preset2.suffix.enabled = this.value;
	ui.preset2.options.enabled = this.value;
	ui.preset2.script.enabled = this.value;
	ui.preset2.bleedCustom.onClick();
	ui.preset2.script.isOn.onClick();
	if (folderMode) ui.actions.ok.enabled = (this.value || ui.preset1.isOn.value) && !!ui.input.source.path;
	else ui.actions.ok.enabled = (this.value || ui.preset1.isOn.value);
};
ui.preset2.bleedCustom.onClick = function () {
	ui.preset2.bleedValue.enabled = this.value;
	if (ui.preset2.bleedValue.enabled) ui.preset2.bleedValue.onChanging();
};
ui.preset1.bleedValue.onChanging =
ui.preset2.bleedValue.onChanging = function () {
	this.text = this.text.replace(/[^\d.,]/gi, '').replace(/^0/gi, '').replace(',', '.');
	if (this.text === '') this.text = '0';
	if (UnitValue(Number(this.text), 'mm').as('pt') > 72) this.text = '25.4';
};
ui.preset1.bleedValue.onDeactivate =
ui.preset2.bleedValue.onDeactivate = function () {
	if (isNaN(this.text)) {
		alert('Invalid value.\nEnter a number between 0 and 25.4 mm.');
		this.text = '0';
	}
};
ui.preset2.script.isOn.onClick = function () {
	ui.preset2.script.file.enabled = ui.preset2.script.browse.enabled = this.value;
};
ui.preset2.script.browse.onClick = function () {
	var f;
	var newFile = File.openDialog('Select a script:');
	if (newFile == null && !ui.preset2.script.path) ui.preset2.script.isOn.notify();
	if (newFile.exists && (WIN ? /\.(jsx*(bin)*)$/i.test(newFile) : /\.(jsx*(bin)*|scpt)$/i.test(newFile))) {
		f = WIN ? decodeURI(newFile.fsName) : decodeURI(newFile.fullName);
		ui.preset2.script.path = newFile;
		ui.preset2.script.file.text = decodeURI(newFile.name);
		ui.preset2.script.file.helpTip = f;
	} else {
		alert('Please select a JavaScript' + (WIN ? '' : ' or AppleScript') + ' file.');
		this.notify();
	}
};
ui.preset2.preset.onChange = function () {
	// Auto-set suffix
	var str = this.selection.text;
	var pdfExpPreset = app.pdfExportPresets.item(str);
	ui.preset2.suffix.text = (/_/g.test(str) && str.slice(str.lastIndexOf('_'))) || '';
	// Populate preset options
	ui.preset2.exportSpreads.value = pdfExpPreset.exportReaderSpreads;
	ui.preset2.cropMarks.value = pdfExpPreset.cropMarks;
	ui.preset2.pageInfo.value = pdfExpPreset.pageInformationMarks;
	ui.preset2.slug.value = pdfExpPreset.includeSlugWithPDF;
	ui.preset2.bleedValue.text = Math.round(pdfExpPreset.pageMarksOffset);
};
ui.preset1.suffix.onChange =
ui.preset2.suffix.onChange = function () {
	var str = this.text.replace(/^\s+|\s+$/g, '');   // Trim
	str = str.replace(forbiddenFilenameCharsRE, ''); // Sanitize suffix
	if (this.text !== str) this.text = str;
};
if (folderMode) {
	ui.input.source.browse.onClick = function () {
		var ff;
		var newFolder = Folder.selectDialog('Select a folder:');
		if (newFolder) {
			ff = WIN ? decodeURI(newFolder.fsName) : decodeURI(newFolder.fullName);
			ui.input.source.path = newFolder;
			ui.input.source.folder.text = truncatePath(ff, 52);
			ui.input.source.folder.helpTip = ff;
			ui.actions.ok.enabled = (ui.preset1.isOn.value || ui.preset2.isOn.value) && !!ui.input.source.path;
		}
	};
}
ui.output.dest.isOn.onClick = function () {
	ui.output.dest.folder.enabled = ui.output.dest.browse.enabled = this.value;
};
ui.output.dest.browse.onClick = function () {
	var ff;
	var newFolder = Folder.selectDialog('Select a folder:');
	if (newFolder == null && !ui.output.dest.path) ui.output.dest.isOn.notify();
	if (newFolder) {
		ff = WIN ? decodeURI(newFolder.fsName) : decodeURI(newFolder.fullName);
		ui.output.dest.path = newFolder;
		ui.output.dest.folder.text = truncatePath(ff, 48);
		ui.output.dest.folder.helpTip = ff;
	}
};
if (ADV) {
	ui.actions.savePrefs.onClick = function () { saveSettings(); };
	ui.actions.resetPrefs.onClick = function () {
		try { settingsFile.remove(); } catch (e) {}
		readSettings();
	};
} else {
	ui.actions.savePrefs.onClick = function () { if (this.value) saveSettings(); };
}
ui.onShow = function () {
	readSettings();
	if (settings.position != null)
		try { ui.location = settings.position; } catch (e) {}
};
ui.onClose = function () { if (ui.actions.savePrefs.value) saveSettings(); };
if (ui.show() === 2) cleanupAndExit();

// Processing

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
// Get a sorted document list
if (folderMode) {
	docs = ui.input.options.subfolders.value ?
		getFilesRecursively(ui.input.source.path).sort() :
		ui.input.source.path.getFiles('*.indd').sort();
	if (docs.length === 0) { alert('No InDesign documents found.'); cleanupAndExit(); }
} else {
	docs = app.documents.everyItem().getElements();
	while ((doc = docs.shift())) try { names.push(doc.fullName); } catch (e) { names.push(doc.name); }
	names.sort();
	docs = [];
	while ((name = names.shift())) docs.push(app.documents.itemByName(name));
}
// Init progress bar
for (i = 0, n = docs.length; i < n; i++) pbWidth = Math.max(pbWidth, decodeURI(docs[i].name).length);
progressBar = new ProgressBar('Exporting', pbWidth + 10);
maxCounter = docs.length * ((ui.preset1.isOn.value ? 1 : 0) + (ui.preset2.isOn.value ? 1 : 0));
progressBar.reset(maxCounter);
// Documents loop
while ((doc = docs.shift())) {
	if (folderMode) {
		doc = app.open(doc);
		if (doc.converted) {
			errors.push(decodeURI(doc.name) + ' must be converted; skipped.');
			doc.close(SaveOptions.NO); continue;
		}
	} else {
		app.activeDocument = doc;
		if (doc.converted) { errors.push(decodeURI(doc.name) + ' must be converted; skipped.'); continue; }
		if (!doc.saved) { errors.push(decodeURI(doc.name) + ' is not saved; skipped.'); continue; }
	}
	// Set measurement units
	old.horizontalMeasurementUnits = doc.viewPreferences.horizontalMeasurementUnits;
	old.verticalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits;
	doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	// Get base folder
	baseFolder = decodeURI(doc.filePath);
	if (ui.output.dest.isOn.value && ui.output.dest.path) {
		if (!ui.output.dest.path.exists) ui.output.dest.path.create();
		baseFolder = WIN ? decodeURI(ui.output.dest.path.fsName) : decodeURI(ui.output.dest.path.fullName);
	}
	checkFonts();
	if (ui.output.options.updateLinks.value) updateLinks();
	// Export preset loop
	old.docSpreads = doc.spreads.length; // Save initial spreads count for extendRange hack (see Export())
	for (var step = 1; step < 3; step++) {
		exp = ui['preset' + step]; // Current export preset
		if (!exp.isOn.value) continue;
		// Create subfolder
		suffix = exp.suffix.text ? ('_' + exp.suffix.text.replace(/^_/, '')) : '';
		subfolder = '';
		if (ui.output.options.subfolders.value && suffix) {
			subfolder = suffix.replace(/^_/, '');
			if (!Folder(baseFolder + '/' + subfolder).exists) Folder(baseFolder + '/' + subfolder).create();
		}
		if (exp.script.enabled && exp.script.isOn.value && exp.script.path.exists) runScript(exp.script.path);
		app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
		app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
		doExport(exp.exportSpreads.value, ui.output.options.split.value, exp.preset.selection.text);
	}
	// Restore measurement units
	doc.viewPreferences.horizontalMeasurementUnits = old.horizontalMeasurementUnits;
	doc.viewPreferences.verticalMeasurementUnits = old.verticalMeasurementUnits;
	// Save and close
	if (ui.output.options.docSave.value && doc.saved && doc.modified) doc.save();
	if (folderMode) doc.close(SaveOptions.NO);
	else if (ui.output.options.docClose.value) doc.close(SaveOptions.NO);
}
// Finish
progressBar.close();
if (errors.length > 0) report(errors, 'Errors', false, true);
cleanupAndExit();

// Functions

function getFilesRecursively(/*Folder*/folder) {
	var file;
	var files = [];
	var fileList = folder.getFiles();
	for (var i = 0, n = fileList.length; i < n; i++) {
		file = fileList[i];
		if (file instanceof Folder) files = files.concat(getFilesRecursively(file));
		else if (file instanceof File && file.name.match(/\.indd$/i)) files.push(file);
	}
	return files;
}

function checkFonts() {
	var usedFonts = doc.fonts.everyItem().getElements();
	for (var i = 0, n = usedFonts.length; i < n; i++) {
		if (usedFonts[i].status !== FontStatus.INSTALLED) {
			errors.push(doc.name + ": Font '" + usedFonts[i].name.replace(/\t/g, ' ') + "' is " +
				String(usedFonts[i].status).toLowerCase().replace('_', ' '));
		}
	}
}

function updateLinks() {
	for (var i = 0, n = doc.links.length; i < n; i++) {
		switch (doc.links[i].status) {
			case LinkStatus.LINK_OUT_OF_DATE:
				doc.links[i].update();
				break;
			case LinkStatus.LINK_MISSING:
				errors.push(doc.name + ": Link '" + doc.links[i].name + "' not found.");
				break;
		}
	}
}

function runScript(path) {
	var ext = path.fsName.slice(path.fsName.lastIndexOf('.') + 1);
	app.doScript(path,
		(function (str) {
			return {
				scpt:   WIN ? undefined : ScriptLanguage.APPLESCRIPT_LANGUAGE,
				js:     ScriptLanguage.JAVASCRIPT,
				jsx:    ScriptLanguage.JAVASCRIPT,
				jsxbin: ScriptLanguage.JAVASCRIPT
			}[str];
		}(ext)),
		undefined,
		UndoModes.ENTIRE_SCRIPT, 'Run script'
	);
}

function doExport(/*bool*/asSpreads, /*bool*/split, /*string*/preset) {
	var baseName, fileSufx, fn, extendRange, range, target;
	if (split) {
		// Export separate pages
		// Note: if a script doubles the number of pages/spreads, the extendRange hack exports them as pairs
		extendRange = (doc.spreads.length === old.docSpreads * 2) && exp.exportSpreads.value;
		target = asSpreads ? doc.spreads : doc.pages;
		baseName = decodeURI(doc.name).replace(/\.indd$/i, '');
		fileSufx = RegExp('([ ._-])([a-zA-Z]{' +
			(extendRange ? target.length / 2 : target.length) + '})$', 'i').exec(baseName);
		for (var i = 0, n = target.length; i < n; i++) {
			fn = uniqueName(fileSufx ?
				/*filename*/ baseName.replace(RegExp(fileSufx[0] + '$'), '') + fileSufx[1] +
				fileSufx[2][extendRange && !(i % 2) ? i / 2 : i] + suffix :
				baseName + '_' + zeroPad(extendRange && !(i % 2) ? i / 2 + 1 : i + 1, String(n).length) + suffix,
				/*folder*/ baseFolder + (subfolder ? '/' + subfolder : ''),
				/*overwrite flag*/ ui.output.options.overwrite.value);
			// Get page range
			if (asSpreads) {
				// Export as spreads
				range = String(target[i].pages[0].documentOffset + 1) + '-' +
					String(target[extendRange ? i + 1 : i].pages[-1].documentOffset + 1);
				if (extendRange && !(i % 2)) i++;
			} else {
				// Export as pages
				range = String(target[i].documentOffset + 1);
			}
			progressBar.update(counter, (baseFolder === decodeURI(doc.filePath) ? decodeURI(File(fn).name) : fn));
			exportToPDF(fn, range, app.pdfExportPresets.item(preset));
		}
	} else {
		// Export all pages
		baseName = decodeURI(doc.name).replace(/\.indd$/i, '') + suffix;
		fn = uniqueName(baseName,
			baseFolder + (subfolder ? '/' + subfolder : ''),
			ui.output.options.overwrite.value);
		progressBar.update(counter, (baseFolder === decodeURI(doc.filePath) ? decodeURI(File(fn).name) : fn));
		exportToPDF(fn, PageRange.ALL_PAGES, app.pdfExportPresets.item(preset));
	}
	counter++;

	function uniqueName(/*string*/filename, /*string*/folder, /*bool*/overwrite) {
		var pdfName = filename + '.pdf';
		var unique = folder + '/' + pdfName;
		var baseRE = RegExp('^' +
			filename.replace(/[|^$(.)\[\]{*+?}\\]/g, '\\$&') + // Escape regex tokens
			(suffix ? '[ _-]*' : '[ _-]+') +
			'\\d+.*.pdf$', 'i');
		var pdfFiles = Folder(folder).getFiles(function (f) {
			if (!(f instanceof File) || !/\.pdf$/i.test(f)) return false;
			return baseRE.test(decodeURI(f.name));
		});
		// Find the last index
		var fileIndex;
		var fileIndexRE = RegExp('^' +
			filename.replace(/[|^$(.)\[\]{*+?}\\]/g, '\\$&') + // Escape regex tokens
			(suffix ? '[ _-]*' : '[ _-]+') +
			'(\\d+)([ _-]*v *\\d*)?([ _-]*copy *\\d*)?([ _-]*v *\\d*)?$', 'i');
		var fileLastIndex = 0;
		for (var i = 0, n = pdfFiles.length; i < n; i++) {
			fileIndex = fileIndexRE.exec(decodeURI(pdfFiles[i].name).replace(/\.pdf$/i, ''));
			if (fileIndex) fileLastIndex = Math.max(fileLastIndex, Number(fileIndex[1]));
		}
		// Get unique name: no index means index = 1, so set it to 2, else increment it; add a space if needed
		if (fileLastIndex === 0) {
			if (!overwrite)
				if (File(unique).exists) unique = unique.replace(/\.pdf$/i, '') + (suffix ? '' : ' ') + '2.pdf';
		} else {
			if (!overwrite) fileLastIndex++;
			unique = unique.replace(/\.pdf$/i, '') + (suffix ? '' : ' ') + String(fileLastIndex) + '.pdf';
		}
		return unique;
	}

	function zeroPad(/*number*/number, /*number*/digits) {
		number = number.toString();
		while (number.length < digits) number = '0' + number;
		return Number(number);
	}

	function exportToPDF(/*string*/filename, /*string|Enum*/pageRange, /*pdfExportPreset*/pdfPreset) {
		// Load preset settings
		for (var key in pdfPreset) {
			if (Object.prototype.hasOwnProperty.call(pdfPreset, key))
				try { app.pdfExportPreferences[key] = pdfPreset[key]; } catch (e) {}
		}
		// Override some of the settings
		app.pdfExportPreferences.pageRange = pageRange;
		app.pdfExportPreferences.exportReaderSpreads = exp.exportSpreads.value;
		app.pdfExportPreferences.cropMarks = exp.cropMarks.value;
		app.pdfExportPreferences.pageInformationMarks = exp.pageInfo.value;
		app.pdfExportPreferences.includeSlugWithPDF = exp.slug.value;
		app.pdfExportPreferences.useDocumentBleedWithPDF = !exp.bleedCustom.value;
		if (app.pdfExportPreferences.useDocumentBleedWithPDF) {
			app.pdfExportPreferences.pageMarksOffset = Math.min(Math.max(
				doc.documentPreferences.properties.documentBleedTopOffset,
				doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
				doc.documentPreferences.properties.documentBleedBottomOffset,
				doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
			), UnitValue('72 pt').as('mm'));
		} else {
			app.pdfExportPreferences.bleedTop =
			app.pdfExportPreferences.bleedBottom =
			app.pdfExportPreferences.bleedInside =
			app.pdfExportPreferences.bleedOutside = Number(exp.bleedValue.text);
			app.pdfExportPreferences.pageMarksOffset =
				Math.min(app.pdfExportPreferences.bleedTop, UnitValue('72 pt').as('mm'));
		}
		doc.exportFile(ExportFormat.PDF_TYPE, File(filename), false);
	}
}

function truncatePath(/*string*/path, /*number*/maxLength) {
	if (path.length > maxLength + 1) path = '\u2026' + path.slice(-maxLength + 1); // ellipsis
	return path;
}

function readSettings() {
	try {
		settings = $.evalFile(settingsFile);
		if (settings.version === undefined || settings.version !== VER) setDefaults();
	} catch (e) { setDefaults(); }
	ui.preset1.isOn.value = settings.presets.preset1.active;
	ui.preset1.preset.selection = findPresetIndex(settings.presets.preset1.name, ui.preset1.preset.items);
	ui.preset1.suffix.text = settings.presets.preset1.suffix;
	ui.preset1.exportSpreads.value = settings.presets.preset1.options.spreads;
	ui.preset1.cropMarks.value = settings.presets.preset1.options.marks.crop;
	ui.preset1.pageInfo.value = settings.presets.preset1.options.marks.info;
	ui.preset1.bleedCustom.value = settings.presets.preset1.options.bleed.custom;
	ui.preset1.bleedValue.text = settings.presets.preset1.options.bleed.value;
	ui.preset1.slug.value = settings.presets.preset1.options.slug;
	ui.preset1.script.path = File(settings.presets.preset1.script.file).exists ?
		File(settings.presets.preset1.script.file) : '';
	if (ui.preset1.script.path) {
		ui.preset1.script.file.text = decodeURI(ui.preset1.script.path.name);
		ui.preset1.script.file.helpTip =
			WIN ? decodeURI(ui.preset1.script.path.fsName) : decodeURI(ui.preset1.script.path.fullName);
	}
	ui.preset1.script.isOn.value = !!ui.preset1.script.path && settings.presets.preset1.script.active;
	ui.preset2.isOn.value = settings.presets.preset2.active;
	ui.preset2.preset.selection = findPresetIndex(settings.presets.preset2.name, ui.preset2.preset.items);
	ui.preset2.suffix.text = settings.presets.preset2.suffix;
	ui.preset2.exportSpreads.value = settings.presets.preset2.options.spreads;
	ui.preset2.cropMarks.value = settings.presets.preset2.options.marks.crop;
	ui.preset2.pageInfo.value = settings.presets.preset2.options.marks.info;
	ui.preset2.bleedCustom.value = settings.presets.preset2.options.bleed.custom;
	ui.preset2.bleedValue.text = settings.presets.preset2.options.bleed.value;
	ui.preset2.slug.value = settings.presets.preset2.options.slug;
	ui.preset2.script.path = File(settings.presets.preset2.script.file).exists ?
		File(settings.presets.preset2.script.file) : '';
	if (ui.preset2.script.path) {
		ui.preset2.script.file.text = decodeURI(ui.preset2.script.path.name);
		ui.preset2.script.file.helpTip =
			WIN ? decodeURI(ui.preset2.script.path.fsName) : decodeURI(ui.preset2.script.path.fullName);
	}
	ui.preset2.script.isOn.value = !!ui.preset2.script.path && settings.presets.preset2.script.active;
	ui.output.dest.path = Folder(settings.output.dest.folder).exists ? Folder(settings.output.dest.folder) : '';
	if (ui.output.dest.path) {
		var f = WIN ? decodeURI(ui.output.dest.path.fsName) : decodeURI(ui.output.dest.path.fullName);
		ui.output.dest.folder.text = truncatePath(f, 48);
		ui.output.dest.folder.helpTip = f;
	}
	ui.output.dest.isOn.value = !!ui.output.dest.path && settings.output.dest.active;
	ui.output.options.subfolders.value = settings.output.options.subfolders;
	ui.output.options.split.value = settings.output.options.split;
	ui.output.options.overwrite.value = false; // settings.output.options.overwrite;
	ui.output.options.updateLinks.value = settings.output.options.updatelinks;
	ui.output.options.docSave.value = settings.output.options.save;
	ui.output.options.docClose.value = settings.output.options.close;
	ui.preset1.isOn.onClick();
	ui.preset2.isOn.onClick();
	ui.output.dest.isOn.onClick();

	function findPresetIndex(/*string*/presetName, /*array*/presetsArray) {
		if (app.pdfExportPresets.itemByName(presetName).isValid) {
		for (var i = 0, n = presetsArray.length; i < n; i++)
			if (presetsArray[i].toString() === presetName) return presetsArray[i].index;
		}
		return 0;
	}
}

function setDefaults() {
	try { settingsFile.remove(); } catch (e) {}
	settings = defaults;
	alert('Preferences were reset.\nEither the file was an old version, or it was corrupt.');
}

function saveSettings() {
	settings = {
		presets: {
			preset1: {
				active: ui.preset1.isOn.value,
				name: ui.preset1.preset.selection.text,
				suffix: ui.preset1.suffix.text,
				options: {
					spreads: ui.preset1.exportSpreads.value,
					marks: {
						crop: ui.preset1.cropMarks.value,
						info: ui.preset1.pageInfo.value
					},
					bleed: {
						custom: ui.preset1.bleedCustom.value,
						value: ui.preset1.bleedValue.text
					},
					slug: ui.preset1.slug.value
				},
				script: {
					active: ui.preset1.script.isOn.value,
					file: ui.preset1.script.path.exists ? decodeURI(ui.preset1.script.path.fullName) : ''
				}
			},
			preset2: {
				active: ui.preset2.isOn.value,
				name: ui.preset2.preset.selection.text,
				suffix: ui.preset2.suffix.text,
				options: {
					spreads: ui.preset2.exportSpreads.value,
					marks: {
						crop: ui.preset2.cropMarks.value,
						info: ui.preset2.pageInfo.value
					},
					bleed: {
						custom: ui.preset2.bleedCustom.value,
						value: ui.preset2.bleedValue.text
					},
					slug: ui.preset2.slug.value
				},
				script: {
					active: ui.preset2.script.isOn.value,
					file: ui.preset2.script.path.exists ? decodeURI(ui.preset2.script.path.fullName) : ''
				}
			}
		},
		output: {
			dest: {
				active: ui.output.dest.isOn.value,
				folder: ui.output.dest.path.exists ? decodeURI(ui.output.dest.path.fullName) : ''
			},
			options: {
				subfolders: ui.output.options.subfolders.value,
				split: ui.output.options.split.value,
				overwrite: false, // ui.output.options.overwrite.value,
				updatelinks: ui.output.options.updateLinks.value,
				save: ui.output.options.docSave.value,
				close: ui.output.options.docClose.value
			}
		},
		position: [ ui.location[0], ui.location[1] ],
		version: VER
	};
	try {
		oldSettings = $.evalFile(settingsFile);
		if (settings.toSource() === oldSettings.toSource()) return;
	} catch (e) {}
	settingsFile.open('w');
	settingsFile.write(settings.toSource());
	settingsFile.close();
}

function cleanupAndExit() {
	app.scriptPreferences.measurementUnit      = old.measurementUnit;
	app.scriptPreferences.userInteractionLevel = old.userInteractionLevel;
	app.pdfExportPreferences.viewPDF           = old.viewPDF;
	exit();
}

/**
 * A simple progress bar. Usage:
 * - create: var progress = new ProgressBar(title, ?maxWidth);
 * - init:   progress.reset(maxValue);
 * - update: progress.update(value, ?message);
 * - close:  progress.close();
 * @param {String} title - Palette title (a counter will be appended)
 * @param {Number} maxValue - Number of steps
 * @param {Number} [maxWidth] - Max message length (characters); if ommitted, no message is shown
 * @param {Number} value - Updated value
 * @param {String} message - Message
 */
function ProgressBar(title, maxWidth) {
	var pb = new Window('palette', title);
	pb.bar = pb.add('progressbar');
	if (maxWidth) { // Full progress bar
		pb.msg = pb.add('statictext { properties: { truncate: "middle" } }');
		pb.msg.characters = Math.max(maxWidth, 50);
		pb.layout.layout();
		pb.bar.bounds = [ 12, 12, pb.msg.bounds[2], 24 ];
	} else { // Mini progress bar
		pb.bar.bounds = [ 12, 12, 476, 24 ];
	}
	this.reset = function (maxValue) {
		pb.bar.value = 0;
		pb.bar.maxvalue = maxValue || 0;
		pb.bar.visible = !!maxValue;
		pb.show();
		if (app.windows.length > 0) {
			var AW = app.activeWindow;
			pb.frameLocation = [
				(AW.bounds[1] + AW.bounds[3] - pb.frameSize.width) / 2,
				(AW.bounds[0] + AW.bounds[2] - pb.frameSize.height) / 2
			];
		}
	};
	this.update = function (value, message) {
		pb.bar.value = value;
		if (maxWidth) {
			pb.msg.visible = !!message;
			if (message) pb.msg.text = message;
		}
		pb.text = title + ' \u2013 ' + value + '/' + pb.bar.maxvalue;
		pb.show(); pb.update();
	};
	this.hide = function () { pb.hide(); };
	this.close = function () { pb.close(); };
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
