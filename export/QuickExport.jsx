/*
	Quick export 22.8.11
	(c) 2021-2022 Paul Chiorean (jpeg@basement.ro)

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
// @include 'progressBar.jsxinc';
// @include 'report.jsxinc';

// Initialisation

var doc, settings, baseFolder, subfolder, suffix, exp, name, progressBar, maxCounter;
var title = 'Quick Export';
var ADV = ScriptUI.environment.keyboardState.altKey;
var WIN = (File.fs === 'Windows');
var invalidFilenameChars = /[<>:"\/\\|?*]/g; // https://gist.github.com/doctaphred/d01d05291546186941e1b7ddc02034d3
var regexTokensRE = /[|^$(.)[\]{*+?}\\]/g;
var script = (function () { try { return app.activeScript; } catch (e) { return new File(e.fileName); } }());
var settingsFile = File(Folder.userData + '/' + script.name.replace(/.[^.]+$/, '') + '.prefs');
var exportPresetsPDF = app.pdfExportPresets.everyItem().name.sort(naturalSorter);
var folderMode = (app.documents.length === 0);
var old = {
	measurementUnit: app.scriptPreferences.measurementUnit,
	userInteractionLevel: app.scriptPreferences.userInteractionLevel,
	viewPDF: app.pdfExportPreferences.viewPDF
};
var errors = [];
var names = [];
var docs = [];
var pbWidth = 50;

var VER = '2.8';
var defaults = {
	presets: {
		preset1: {
			active: true,
			name: '_preview',
			dpi: '150',
			suffix: 'preview',
			options: {
				spreads: true,
				marks: { crop: true, info: true },
				bleed: { custom: false, value: '3' },
				slug: true
			},
			script: {
				active: false,
				file: ''
			}
		},
		preset2: {
			active: false,
			name: '_print',
			dpi: '350',
			suffix: 'print',
			options: {
				spreads: true,
				marks: { crop: true, info: true },
				bleed: { custom: false, value: '3' },
				slug: true
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
			updatelinks: true,
			save: true,
			close: true
		}
	},
	position: '',
	version: VER
};

app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALERTS;
app.pdfExportPreferences.viewPDF = false;

// User interface

var ui = new Window('dialog { alignChildren: "left", margins: 16, orientation: "column", spacing: 10 }');
ui.text = title;
ui.main = ui.add('group { margins: 0, orientation: "column", preferredSize: [ 590, -1 ], spacing: 10 }');

// -- Input source
if (folderMode) {
	ui.input = ui.main.add('panel { text: "Input folder", alignChildren: "left", margins: [ 10, 15, 10, 10 ], orientation: "column", spacing: 10 }');
		ui.input.source = ui.input.add('group { margins: 0, orientation: "row", spacing: 10 }');
			ui.input.source.folder = ui.input.source.add('edittext { preferredSize: [ 458, 24 ], properties: { readonly: false } }');
			ui.input.source.browse = ui.input.source.add('button { text: "Browse", preferredSize: [ 100, 24 ] }');
		ui.input.options = ui.input.add('group { margins: 0, orientation: "row", spacing: 10 }');
			ui.input.options.subfolders = ui.input.options.add('checkbox { text: "Include subfolders", alignment: "bottom" }');
}

// -- Export options
ui.presets = ui.main.add('panel { text: "Export presets", alignChildren: "left", margins: [ 10, 15, 10, 10 ], orientation: "column", spacing: 10 }');
	ui.preset1 = ui.presets.add('group { margins: 0, orientation: "row", spacing: 10 }');
		ui.preset1.isOn = ui.preset1.add('checkbox { alignment: "bottom" }');
		ui.preset1.preset = ui.preset1.add('dropdownlist', undefined, exportPresetsPDF);
		ui.preset1.preset.preferredSize = [ 290, 24 ];
		ui.preset1.add('statictext { text: "DPI:", justify: "right", preferredSize: [ 25, 24 ] }');
		ui.preset1.dpi = ui.preset1.add('edittext { justify: "center", preferredSize: [ 45, 24 ] }');
		ui.preset1.dpi.helpTip = 'Export resolution';
		ui.preset1.add('statictext { text: "Suffix:", justify: "right", preferredSize: [ 40, 24 ] }');
		ui.preset1.suffix = ui.preset1.add('edittext { preferredSize: [ 100, 24 ] }');
		ui.preset1.suffix.helpTip = "Append this text to the exported file name (everything in\nthe preset name after the last '_' will be autodetected)";
	ui.preset1.options = WIN ? ui.presets.add('group { spacing: 12 }') : ui.presets.add('group { spacing: 14 }');
		ui.preset1.asSpreads = ui.preset1.options.add('checkbox { text: "As spreads", alignment: "bottom" }');
		ui.preset1.asSpreads.helpTip = 'Export as spreads';
		ui.preset1.options.add('panel', undefined, undefined).alignment = 'fill';
		ui.preset1.cropMarks = ui.preset1.options.add('checkbox { text: "Crop marks", alignment: "bottom" }');
		ui.preset1.cropMarks.helpTip = 'Include crop marks';
		ui.preset1.pageInfo = ui.preset1.options.add('checkbox { text: "Page info", alignment: "bottom" }');
		ui.preset1.pageInfo.helpTip = 'Include page information';
		ui.preset1.options.add('panel', undefined, undefined).alignment = 'fill';
		ui.preset1.slug = ui.preset1.options.add('checkbox { text: "Slug area", alignment: "bottom" }');
		ui.preset1.slug.helpTip = 'Include slug area';
		ui.preset1.bleedCustom = ui.preset1.options.add('checkbox { text: "Custom bleed:", alignment: "bottom" }');
		ui.preset1.bleedCustom.helpTip = 'Override document bleed settings';
		ui.preset1.bleedValue = ui.preset1.options.add('edittext { characters: 4, justify: "center", preferredSize: [ 51, 24 ] }');
		ui.preset1.bleedValue.helpTip = 'Enter a value between 0 and 25.4 mm';
	ui.preset1.script = ui.presets.add('group');
		ui.preset1.script.st = ui.preset1.script.add('statictext { text: "Run a script:", preferredSize: [ 80, 24 ] }');
		ui.preset1.script.st.helpTip = 'Run a JavaScript or AppleScript before exporting';
		ui.preset1.script.isOn = ui.preset1.script.add('checkbox { alignment: "bottom" }');
		ui.preset1.script.file = ui.preset1.script.add('edittext { preferredSize: [ 340, 24 ], properties: { readonly: true } }');
		ui.preset1.script.browse = ui.preset1.script.add('button { text: "Browse", preferredSize: [ 100, 24 ] }');
	ui.presets.add('panel { alignment: "fill" }');

	ui.preset2 = ui.presets.add('group { margins: 0, orientation: "row", spacing: 10 }');
		ui.preset2.isOn = ui.preset2.add('checkbox { alignment: "bottom" }');
		ui.preset2.preset = ui.preset2.add('dropdownlist', undefined, exportPresetsPDF);
		ui.preset2.preset.preferredSize = [ 290, 24 ];
		ui.preset2.add('statictext { text: "DPI:", justify: "right", preferredSize: [ 25, 24 ] }');
		ui.preset2.dpi = ui.preset2.add('edittext { justify: "center", preferredSize: [ 45, 24 ] }');
		ui.preset2.dpi.helpTip = 'Export resolution';
		ui.preset2.add('statictext { text: "Suffix:", justify: "right", preferredSize: [ 40, 24 ] }');
		ui.preset2.suffix = ui.preset2.add('edittext { preferredSize: [ 100, 24 ] }');
		ui.preset2.suffix.helpTip = "Append this text to the exported file name (everything in\nthe preset name after the last '_' will be autodetected)";
		ui.preset2.options = WIN ? ui.presets.add('group { spacing: 12 }') : ui.presets.add('group { spacing: 14 }');
		ui.preset2.asSpreads = ui.preset2.options.add('checkbox { text: "As spreads", alignment: "bottom" }');
		ui.preset2.asSpreads.helpTip = 'Export as spreads';
		ui.preset2.options.add('panel', undefined, undefined).alignment = 'fill';
		ui.preset2.cropMarks = ui.preset2.options.add('checkbox { text: "Crop marks", alignment: "bottom" }');
		ui.preset2.cropMarks.helpTip = 'Include crop marks';
		ui.preset2.pageInfo = ui.preset2.options.add('checkbox { text: "Page info", alignment: "bottom" }');
		ui.preset2.pageInfo.helpTip = 'Include page information';
		ui.preset2.options.add('panel', undefined, undefined).alignment = 'fill';
		ui.preset2.slug = ui.preset2.options.add('checkbox { text: "Slug area", alignment: "bottom" }');
		ui.preset2.slug.helpTip = 'Include slug area';
		ui.preset2.bleedCustom = ui.preset2.options.add('checkbox { text: "Custom bleed:", alignment: "bottom" }');
		ui.preset2.bleedCustom.helpTip = 'Override document bleed settings';
		ui.preset2.bleedValue = ui.preset2.options.add('edittext { characters: 4, justify: "center", preferredSize: [ 51, 24 ] }');
		ui.preset2.bleedValue.helpTip = 'Enter a value between 0 and 25.4 mm';
	ui.preset2.script = ui.presets.add('group');
		ui.preset2.script.st = ui.preset2.script.add('statictext { text: "Run a script:", preferredSize: [ 80, 24 ] }');
		ui.preset2.script.st.helpTip = 'Run a JavaScript or AppleScript before exporting';
		ui.preset2.script.isOn = ui.preset2.script.add('checkbox { alignment: "bottom" }');
		ui.preset2.script.file = ui.preset2.script.add('edittext { preferredSize: [ 340, 24 ], properties: { readonly: true } }');
		ui.preset2.script.browse = ui.preset2.script.add('button { text: "Browse", preferredSize: [ 100, 24 ] }');

// -- Output options
ui.output = ui.main.add('panel { text: "Output folder and options", alignChildren: "left", margins: [ 10, 15, 10, 10 ], orientation: "column", spacing: 10 }');
	ui.output.dest = ui.output.add('group { margins: 0, orientation: "row", spacing: 10 }');
		ui.output.dest.isOn = ui.output.dest.add('checkbox { alignment: "bottom" }');
		ui.output.dest.folder = ui.output.dest.add('edittext { preferredSize: [ 430, 24 ], properties: { readonly: false } }');
		ui.output.dest.browse = ui.output.dest.add('button { text: "Browse", preferredSize: [ 100, 24 ] }');
	ui.output.options = ui.output.add('group { alignChildren: "top", margins: [ 0, 5, 0, 0 ], orientation: "row", spacing: 15 }');
		ui.output.opt1 = ui.output.options.add('group { alignChildren: "left", margins: 0, orientation: "column", spacing: 5 }');
			ui.output.options.updateLinks = ui.output.opt1.add('checkbox { text: "Update out of date links" }');
			ui.output.options.docSave = ui.output.opt1.add('group');
				ui.output.options.docSave.isOn = ui.output.options.docSave.add('checkbox { text: "Save:" }');
				ui.output.options.docSave.scope = ui.output.options.docSave.add('group');
					ui.output.options.docSave.scope.mod = ui.output.options.docSave.scope.add('radiobutton { text: "only modified" }');
					ui.output.options.docSave.scope.mod.helpTip = 'Save only modified documents';
					ui.output.options.docSave.scope.mod.value = true;
					ui.output.options.docSave.scope.all = ui.output.options.docSave.scope.add('radiobutton { text: "all documents" }');
					ui.output.options.docSave.scope.all.helpTip = "Save all documents (using 'Save as\u2026')";
			ui.output.options.docSaveAs = ui.output.opt1.add('checkbox { text: "Use \'Save as\u2026\' to reduce documents size" }');
			ui.output.options.docSaveAs.helpTip = 'Documents will be saved as new to remove cruft and reduce their size';
			ui.output.options.docClose = ui.output.opt1.add('checkbox { text: "Close documents after export" }');
			ui.output.options.docClose.enabled = !folderMode;
		ui.output.options.add('panel', undefined, undefined).alignment = 'fill';
		ui.output.opt2 = ui.output.options.add('group { alignChildren: "left", margins: 0, orientation: "column", spacing: 5 }');
			ui.output.options.subfolders = ui.output.opt2.add('checkbox { text: "Export in subfolders" }');
			ui.output.options.subfolders.helpTip = "Subfolders will be created from the suffix (the text after '+' is ignored)";
			ui.output.options.split = ui.output.opt2.add('checkbox { text: "Export separate pages/spreads" }');
			ui.output.options.overwrite = ui.output.opt2.add('checkbox { text: "Overwrite existing files" }');

// -- Actions
ui.actions = ui.add('group { orientation: "row" }');
if (ADV) {
	ui.actions.resetPrefs = ui.actions.add('button { text: "Reset preferences", preferredSize: [ 130, -1 ] }');
	ui.actions.add('group { preferredSize: [ 270, -1 ] }');
} else {
	ui.actions.savePrefs = ui.actions.add('checkbox { text: "Save preferences", preferredSize: [ 410, -1 ] }');
	ui.actions.savePrefs.value = true;
}

ui.actions.add('button { text: "Cancel", preferredSize: [ 80, -1 ], properties: { name: "cancel" } }');
ui.actions.ok = ui.actions.add('button { text: "Start", preferredSize: [ 80, -1 ], properties: { name: "ok" } }');

// UI callback functions

// -- Input source
if (folderMode) {
	ui.text = 'Select an input folder';
	ui.input.source.browse.onClick = function () {
		var ff = Folder.selectDialog('Select a folder:');
		if (ff != null) ui.input.source.folder.text = ff;
		ui.input.source.folder.onChange();
	};
	ui.input.source.folder.onChange = function () {
		var ff;
		if (Folder(ui.input.source.folder.text).exists) {
			ui.input.source.path = Folder(ui.input.source.folder.text);
			ff = WIN ? decodeURI(ui.input.source.path.fsName) : decodeURI(ui.input.source.path.fullName);
			ui.input.source.folder.text = ff;
		} else {
			ui.input.source.path = false;
		}
		updateOKStatus();
	};
	ui.output.options.docClose.helpTip = 'In batch folder mode documents are always closed after export';
}

// -- Export options
ui.preset1.isOn.onClick = function () {
	ui.preset1.preset.enabled = ui.preset1.suffix.enabled = this.value;
	ui.preset1.dpi.enabled = this.value;
	ui.preset1.options.enabled = this.value;
	ui.preset1.script.enabled = this.value;
	ui.preset1.bleedCustom.onClick();
	ui.preset1.script.isOn.onClick();
	updateOKStatus();
};
ui.preset1.bleedCustom.onClick = function () {
	ui.preset1.bleedValue.enabled = this.value;
	if (ui.preset1.bleedValue.enabled) ui.preset1.bleedValue.onDeactivate();
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
	var str = this.selection.text;
	var pdfExpPreset = app.pdfExportPresets.item(str);
	ui.preset1.suffix.text = /_/g.test(str) ? str.replace(/^.*_/, '') : '';
	ui.preset1.dpi.text = pdfExpPreset.colorBitmapSamplingDPI;
	ui.preset1.asSpreads.value = pdfExpPreset.exportReaderSpreads;
	ui.preset1.cropMarks.value = pdfExpPreset.cropMarks;
	ui.preset1.pageInfo.value = pdfExpPreset.pageInformationMarks;
	ui.preset1.slug.value = pdfExpPreset.includeSlugWithPDF;
	ui.preset1.bleedValue.text = Math.round(pdfExpPreset.pageMarksOffset);
	ui.preset1.preset.helpTip = (function (preset) {
		var msg = [];
		msg.push('Profile: ' + (preset.pdfDestinationProfile.constructor.name === 'String' ?
			preset.effectivePDFDestinationProfile :
			String(preset.pdfDestinationProfile).toLowerCase().replace(/_/g, ' ').replace('use ', ''))
		);
		msg.push('Standard: ' + String(preset.pdfColorSpace).toLowerCase().replace(/_/g, ' '));
		msg.push('Color space: ' + String(preset.pdfColorSpace).toLowerCase().replace(/_/g, ' ')
			.replace('rgb', 'RGB').replace('cmyk', 'CMYK'));
		msg.push('Resolution: ' + preset.colorBitmapSamplingDPI + ' dpi');
		msg.push('Compression: ' + String(preset.colorBitmapCompression).toLowerCase().replace(/_/g, ' ').replace(' compression', ''));
		msg.push('Quality: ' + String(preset.colorBitmapQuality).toLowerCase().replace(/_/g, ' '));
		msg.push('\nExport as ' + (preset.exportReaderSpreads ? 'spreads' : 'pages'));
		if (preset.useDocumentBleedWithPDF) msg.push('Use document bleed');
		if (preset.cropMarks || preset.pageInformationMarks || preset.includeSlugWithPDF || preset.exportLayers) {
			msg.push('Include ' +
				((preset.cropMarks ? 'crop marks, ' : '') +
				(preset.pageInformationMarks ? 'page info, ' : '') +
				(preset.includeSlugWithPDF ? 'slug area' : '') +
				(preset.exportLayers ? 'layers' : ''))
					.replace(/, $/, '')
			);
		}
		return msg.join('\n');
	}(pdfExpPreset));
};

ui.preset2.isOn.onClick = function () {
	ui.preset2.preset.enabled = ui.preset2.suffix.enabled = this.value;
	ui.preset2.dpi.enabled = this.value;
	ui.preset2.options.enabled = this.value;
	ui.preset2.script.enabled = this.value;
	ui.preset2.bleedCustom.onClick();
	ui.preset2.script.isOn.onClick();
	updateOKStatus();
};
ui.preset2.bleedCustom.onClick = function () {
	ui.preset2.bleedValue.enabled = this.value;
	if (ui.preset2.bleedValue.enabled) ui.preset2.bleedValue.onDeactivate();
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
	var str = this.selection.text;
	var pdfPreset = app.pdfExportPresets.item(str);
	ui.preset2.suffix.text = /_/g.test(str) ? str.replace(/^.*_/, '') : '';
	ui.preset2.dpi.text = pdfPreset.colorBitmapSamplingDPI;
	ui.preset2.asSpreads.value = pdfPreset.exportReaderSpreads;
	ui.preset2.cropMarks.value = pdfPreset.cropMarks;
	ui.preset2.pageInfo.value = pdfPreset.pageInformationMarks;
	ui.preset2.slug.value = pdfPreset.includeSlugWithPDF;
	ui.preset2.bleedValue.text = Math.round(pdfPreset.pageMarksOffset);
	ui.preset2.preset.helpTip = (function (/*pdfExportPreset*/preset) {
		var msg = [];
		msg.push('Profile: ' + (preset.pdfDestinationProfile.constructor.name === 'String' ?
			preset.effectivePDFDestinationProfile :
			String(preset.pdfDestinationProfile).toLowerCase().replace(/_/g, ' ').replace('use ', ''))
		);
		msg.push('Color space: ' + String(preset.pdfColorSpace).toLowerCase().replace(/_/g, ' ')
			.replace('rgb', 'RGB').replace('cmyk', 'CMYK'));
		msg.push('Resolution: ' + preset.colorBitmapSamplingDPI + ' dpi');
		msg.push('Compression: ' + String(preset.colorBitmapCompression).toLowerCase().replace(/_/g, ' ').replace(' compression', ''));
		msg.push('Quality: ' + String(preset.colorBitmapQuality).toLowerCase().replace(/_/g, ' '));
		msg.push('\nExport as ' + (preset.exportReaderSpreads ? 'spreads' : 'pages'));
		if (preset.useDocumentBleedWithPDF) msg.push('Use document bleed');
		if (preset.cropMarks || preset.pageInformationMarks || preset.includeSlugWithPDF || preset.exportLayers) {
			msg.push('Include ' +
				((preset.cropMarks ? 'crop marks, ' : '') +
				(preset.pageInformationMarks ? 'page info, ' : '') +
				(preset.includeSlugWithPDF ? 'slug area' : '') +
				(preset.exportLayers ? 'layers' : ''))
					.replace(/, $/, '')
			);
		}
		return msg.join('\n');
	}(pdfPreset));
};

ui.preset1.suffix.onChange =
ui.preset2.suffix.onChange = function () {
	var str = this.text.replace(/^\s+|\s+$/g, '').replace(invalidFilenameChars, '').replace(/^_/, '');
	if (this.text !== str) this.text = str;
};
ui.preset1.dpi.onDeactivate =
ui.preset2.dpi.onDeactivate = function () {
	this.text = Number(this.text.replace(/[^\d.,]/gi, '').replace(',', '.'));
	if (isNaN(this.text) || this.text < 9 || this.text > 2400) {
		alert('Invalid value.\nEnter a number between 9 and 2400.');
		this.text = '300';
	}
};
ui.preset1.bleedValue.onDeactivate =
ui.preset2.bleedValue.onDeactivate = function () {
	if (this.text === '') this.text = '0';
	this.text = Number(this.text.replace(/[^\d.,]/gi, '').replace(',', '.'));
	if (isNaN(this.text) || UnitValue(this.text, 'mm').as('pt') > 72) {
		alert('Invalid value.\nEnter a number between 0 and 25.4 mm.');
		this.text = '3';
	}
};

// -- Output options
ui.output.dest.isOn.onClick = function () {
	ui.output.dest.folder.enabled = ui.output.dest.browse.enabled = this.value;
	ui.output.dest.folder.onChange();
};
ui.output.dest.browse.onClick = function () {
	var ff = Folder.selectDialog('Select a folder:');
	if (ff != null) ui.output.dest.folder.text = ff;
	ui.output.dest.folder.onChange();
};
ui.output.dest.folder.onChange = function () {
	var ff;
	if (Folder(ui.output.dest.folder.text).exists) {
		ui.output.dest.path = Folder(ui.output.dest.folder.text);
		ff = WIN ? decodeURI(ui.output.dest.path.fsName) : decodeURI(ui.output.dest.path.fullName);
		ui.output.dest.folder.text = ff;
	} else {
		ui.output.dest.path = false;
	}
	updateOKStatus();
};

ui.output.options.docSave.isOn.onClick = function () {
	ui.output.options.docSave.scope.enabled = this.value;
	ui.output.options.docSaveAs.enabled = this.value;
};
ui.output.options.docSave.scope.mod.onClick = function () {
	if (this.value) ui.output.options.docSave.isOn.value = true;
};
ui.output.options.docSave.scope.all.onClick = function () {
	if (this.value) ui.output.options.docSave.isOn.value = true;
	ui.output.options.docSaveAs.enabled = this.value;
	ui.output.options.docSaveAs.value = this.value;
};
ui.output.options.docSaveAs.onClick = function () {
	if (!this.value) ui.output.options.docSave.scope.mod.value = true;
};

function updateOKStatus() {
	// Enable/disable 'Start' button
	ui.actions.ok.enabled = // If (a) && (b) && (c):
		(folderMode ? !!ui.input.source.path : true) &&               // a) If in batch folder mode, it must be valid
		(ui.output.dest.isOn.value ? !!ui.output.dest.path : true) && // b) If custom output folder, it must be valid
		(ui.preset1.isOn.value || ui.preset2.isOn.value);             // c) At least a preset must be selected

	// Update help tips
	if (folderMode) { // Batch folder mode
		if (ui.input.source.folder.text.length === 0) {
			ui.input.source.folder.helpTip = 'Select a folder';
		} else {
			ui.input.source.folder.helpTip = ui.input.source.path ?
				(WIN ? decodeURI(ui.input.source.path.fsName) : decodeURI(ui.input.source.path.fullName)) :
				'Error: Folder not found';
		}
	}
	if (ui.output.dest.isOn.value) { // Custom output folder
		if (ui.output.dest.folder.text.length === 0) {
			ui.output.dest.folder.helpTip = 'Select a folder';
		} else {
			ui.output.dest.folder.helpTip = ui.output.dest.path ?
				(WIN ? decodeURI(ui.output.dest.path.fsName) : decodeURI(ui.output.dest.path.fullName)) :
				'Error: Folder not found';
		}
	} else {
		ui.output.dest.folder.helpTip = 'Using document folders';
	}
	ui.actions.ok.helpTip = ui.actions.ok.enabled ? '' : 'Error';

	// Display errors in titlebar and 'Start' help tip
	if (folderMode) { // Batch folder mode
		if (ui.input.source.folder.text.length === 0) {
			ui.text = ui.actions.ok.helpTip = 'Select an input folder';
			return;
		} else if (ui.input.source.path) {
			ui.text = title;
		} else {
			ui.text = ui.actions.ok.helpTip = 'Error: Input folder not found';
			return;
		}
	}
	if (!ui.preset1.isOn.value && !ui.preset2.isOn.value) { // Presets
		ui.text = ui.actions.ok.helpTip = 'Select an export preset';
		return;
	}
	if (ui.output.dest.isOn.value) { // Custom output folder
		if (ui.output.dest.folder.text.length === 0) {
			ui.text = ui.actions.ok.helpTip = 'Select an output folder';
			return;
		} else if (ui.output.dest.path) {
			ui.text = title;
		} else {
			ui.text = ui.actions.ok.helpTip = 'Error: Output folder not found';
			return;
		}
	}
}

// -- Actions
if (ADV) {
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
		getFilesRecursively(ui.input.source.path).sort(naturalSorter) :
		ui.input.source.path.getFiles('*.indd').sort(naturalSorter);
	if (docs.length === 0) { alert('No InDesign documents found.'); cleanupAndExit(); }
} else {
	docs = app.documents.everyItem().getElements();
	while ((doc = docs.shift())) try { names.push(doc.fullName); } catch (e) { names.push(doc.name); }
	names.sort();
	docs = [];
	while ((name = names.shift())) docs.push(app.documents.itemByName(name));
}

// Init progress bar
maxCounter = docs.length * ((ui.preset1.isOn.value ? 1 : 0) + (ui.preset2.isOn.value ? 1 : 0));
for (i = 0, n = docs.length; i < n; i++) pbWidth = Math.max(pbWidth, decodeURI(docs[i].name).length);
progressBar = new ProgressBar('Exporting', maxCounter, pbWidth + 10);

// Documents loop
while ((doc = docs.shift())) {
	if (folderMode) {
		doc = app.open(doc);
		if (doc.converted) {
			errors.push(decodeURI(doc.name) + ': Must be converted; skipped.');
			doc.close(SaveOptions.NO); continue;
		}
	} else {
		app.activeDocument = doc;
		if (doc.converted) { errors.push(decodeURI(doc.name) + ': Must be converted; skipped.'); continue; }
		if (!doc.saved) { errors.push(decodeURI(doc.name) + ': Is not saved; skipped.'); continue; }
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
	checkTextOverflow();
	if (ui.output.options.updateLinks.value) updateLinks();

	// Export preset loop
	old.docSpreads = doc.spreads.length; // Save initial spreads count for extendRange hack (see Export())
	for (var step = 1; step < 3; step++) {
		exp = ui['preset' + step]; // Current export preset
		if (!exp.isOn.value) continue;
		// Create subfolder
		suffix = exp.suffix.text ? ('_' + exp.suffix.text) : '';
		if (/print$/i.test(suffix) && doc.layers.itemByName('dielines').isValid) suffix += '+diecut'; // Hack: +diecut
		subfolder = '';
		if (ui.output.options.subfolders.value && suffix) {
			subfolder = suffix.replace(/^_/, '').replace(/\+.*$/, '').replace(/^\s+|\s+$/g, '');
			if (!Folder(baseFolder + '/' + subfolder).exists) Folder(baseFolder + '/' + subfolder).create();
		}

		// Hack: show/hide .layers
		for (i = 0; i < doc.layers.length; i++) {
			if (!/^\./.test(doc.layers[i].name)) continue;
			if (/preview$/i.test(exp.preset.selection.text)) doc.layers[i].visible = true;
			else if (/print(\+diecut)?$/i.test(exp.preset.selection.text)) doc.layers[i].visible = false;
		}

		if (exp.script.enabled && exp.script.isOn.value && exp.script.path.exists) runScript(exp.script.path);
		app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
		app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
		doExport(exp.asSpreads.value, ui.output.options.split.value, exp.preset.selection.text);
	}

	// Restore measurement units
	doc.viewPreferences.horizontalMeasurementUnits = old.horizontalMeasurementUnits;
	doc.viewPreferences.verticalMeasurementUnits = old.verticalMeasurementUnits;

	// Save and close
	if (ui.output.options.docSave.isOn.value) {
		if (ui.output.options.docSave.scope.mod.value) {
			if (doc.modified) {
				doc.save(ui.output.options.docSaveAs.enabled && ui.output.options.docSaveAs.value ?
					File(doc.fullName) : undefined);
			}
		} else { doc.save(File(doc.fullName)); }
	}
	if (folderMode) doc.close(SaveOptions.NO);
	else if (ui.output.options.docClose.value) doc.close(SaveOptions.NO);
}

// Finish
cleanupAndExit();

// Helper functions

function checkFonts() {
	var usedFonts = doc.fonts.everyItem().getElements();
	for (var i = 0, n = usedFonts.length; i < n; i++) {
		if (usedFonts[i].status !== FontStatus.INSTALLED) {
			errors.push(doc.name + ": Font '" + usedFonts[i].name.replace(/\t/g, ' ') + "' is " +
				String(usedFonts[i].status).toLowerCase().replace(/_/g, ' '));
		}
	}
}

function checkTextOverflow() {
	for (var i = 0; i < doc.allPageItems.length; i++) {
		if (doc.allPageItems[i].constructor.name === 'TextFrame') {
			if (doc.allPageItems[i].overflows && doc.allPageItems[i].parentPage) {
				errors.push(doc.name + ': Text overflows.');
				return;
			}
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
				errors.push(doc.name + ": Link '" + doc.links[i].name + "' not found.");
				break;
		}
	}
}

function runScript(/*File*/path) {
	var ext = path.fsName.replace(/^.*\./, '');
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
	var fileSufx, fn, extendRange, range;
	var target = asSpreads ? doc.spreads : doc.pages;
	var baseName = decodeURI(doc.name).replace(/\.indd$/i, '');
	var isCombo = /[_-]\s*\d+([.,]\d+)?\s*([cm]m)?\s*x\s*\d+([.,]\d+)?\s*([cm]m)?\s*\+\s*\d+([.,]\d+)?\s*([cm]m)?\s*x\s*\d+([.,]\d+)?\s*([cm]m)?\s*(?!x)\s*(?!\d)/ig.test(decodeURI(doc.name));

	if (split && !isCombo) { // Export separate pages
		// Note: if a script doubles the number of pages/spreads, the extendRange hack exports them as pairs
		extendRange = (doc.spreads.length === old.docSpreads * 2) && exp.asSpreads.value;
		fileSufx = RegExp('([ ._-])([a-zA-Z]{' +
			(extendRange ? target.length / 2 : target.length) + '})$', 'i').exec(baseName);
		progressBar.update();
		progressBar.init2(target.length);

		for (var i = 0, n = target.length; i < n; i++) {
			// Add a page/spread index
			fn = baseName;
			if (fileSufx) { // The target already has an index
				fn = fn.replace(RegExp(fileSufx[0] + '$'), '') +
					fileSufx[1] + fileSufx[2][extendRange && !(i % 2) ? i / 2 : i];
			} else if (target.length > 1) { // Add index only if needed
				fn += '_' + zeroPad(extendRange && !(i % 2) ? i / 2 + 1 : i + 1, String(n).length);
			}
			// Get unique export file name
			fn = uniqueName(fn + suffix, baseFolder + (subfolder ? '/' + subfolder : ''),
				ui.output.options.overwrite.value);
			// Get page range
			if (asSpreads) { // Export as spreads
				range = String(target[i].pages[0].documentOffset + 1) + '-' +
					String(target[extendRange ? i + 1 : i].pages[-1].documentOffset + 1);
				if (extendRange && !(i % 2)) i++;
			} else { // Export as pages
				range = String(target[i].documentOffset + 1);
			}
			progressBar.update2();
			progressBar.msg(baseFolder === decodeURI(doc.filePath) ? decodeURI(File(fn).name) : fn);
			exportToPDF(fn, range, app.pdfExportPresets.item(preset));
		}
	} else { // Export all pages
		baseName += suffix;
		fn = uniqueName(baseName,
			baseFolder + (subfolder ? '/' + subfolder : ''),
			ui.output.options.overwrite.value);
		progressBar.update();
		progressBar.msg(baseFolder === decodeURI(doc.filePath) ? decodeURI(File(fn).name) : fn);
		exportToPDF(fn, PageRange.ALL_PAGES, app.pdfExportPresets.item(preset));
	}

	function uniqueName(/*string*/filename, /*string*/folder, /*bool*/overwrite) {
		var pdfName = filename + '.pdf';
		var unique = folder + '/' + pdfName;
		var baseRE = RegExp('^' +
			filename.replace(regexTokensRE, '\\$&') + // Escape regex tokens
			(suffix ? '[ _-]*' : '[ _-]+') +
			'\\d+.*.pdf$', 'i');
		var pdfFiles = Folder(folder).getFiles(function (f) {
			if (!(f instanceof File) || !/\.pdf$/i.test(f)) return false;
			return baseRE.test(decodeURI(f.name));
		});

		// Find the last index
		var fileIndex;
		var fileIndexRE = RegExp('^' +
			filename.replace(regexTokensRE, '\\$&') + // Escape regex tokens
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

	function exportToPDF(/*string*/filename, /*string|Enum*/pageRange, /*pdfExportPreset*/pdfPreset) {
		if (ScriptUI.environment.keyboardState.keyName === 'Escape') cleanupAndExit();
		var fPg, lPg, spreadWidth;

		// Load preset settings
		for (var key in pdfPreset) {
			if (Object.prototype.hasOwnProperty.call(pdfPreset, key))
				try { app.pdfExportPreferences[key] = pdfPreset[key]; } catch (e) {}
		}

		// Override some of the settings
		app.pdfExportPreferences.pageRange = pageRange;
		app.pdfExportPreferences.colorBitmapSamplingDPI = Number(exp.dpi.text);
		app.pdfExportPreferences.grayscaleBitmapSamplingDPI = Number(exp.dpi.text);
		app.pdfExportPreferences.monochromeBitmapSamplingDPI = (function (/*number*/dpi) {
			if (dpi <= 96) return 300;
			else if (dpi <= 150) return 600;
			else if (dpi < 300) return 1200;
			return 2400;
		}(Number(exp.dpi.text)));
		app.pdfExportPreferences.exportReaderSpreads = exp.asSpreads.value;
		app.pdfExportPreferences.cropMarks = exp.cropMarks.value;
		app.pdfExportPreferences.pageInformationMarks = exp.pageInfo.value;
		app.pdfExportPreferences.includeSlugWithPDF = exp.slug.value;
		app.pdfExportPreferences.useDocumentBleedWithPDF = !exp.bleedCustom.value;

		// Custom bleed value
		if (app.pdfExportPreferences.useDocumentBleedWithPDF) {
			app.pdfExportPreferences.pageMarksOffset = Math.min(
				Math.max(
					doc.documentPreferences.properties.documentBleedTopOffset,
					doc.documentPreferences.properties.documentBleedInsideOrLeftOffset,
					doc.documentPreferences.properties.documentBleedBottomOffset,
					doc.documentPreferences.properties.documentBleedOutsideOrRightOffset
				) + 1, // Offset page marks 1 mm --
				UnitValue('72 pt').as('mm')); // -- but limit to 72 pt
		} else {
			app.pdfExportPreferences.bleedTop =
			app.pdfExportPreferences.bleedBottom =
			app.pdfExportPreferences.bleedInside =
			app.pdfExportPreferences.bleedOutside = Number(exp.bleedValue.text);
			app.pdfExportPreferences.pageMarksOffset =
				Math.min(app.pdfExportPreferences.bleedTop + 1, UnitValue('72 pt').as('mm'));
		}

		// Hack: omit printer's marks if bleed is zero --
		if (doc.documentPreferences.properties.documentBleedTopOffset +
			doc.documentPreferences.properties.documentBleedInsideOrLeftOffset +
			doc.documentPreferences.properties.documentBleedBottomOffset +
			doc.documentPreferences.properties.documentBleedOutsideOrRightOffset === 0 &&
			!app.pdfExportPreferences.includeSlugWithPDF) { // -- but include if user wants slug
			app.pdfExportPreferences.cropMarks = false;
			app.pdfExportPreferences.pageInformationMarks = false;
		}
		// Hack: don't include page information on pages with very small widths
		if (pageRange === PageRange.ALL_PAGES) {
			fPg = target.constructor.name === 'Spreads' ? target[0].pages[0]  : target[0];
			lPg = target.constructor.name === 'Spreads' ? target[0].pages[-1] : target[0];
		} else if (/-/.test(pageRange)) {
			fPg = doc.pages.item(pageRange.slice(0, pageRange.lastIndexOf('-')));
			lPg = doc.pages.item(pageRange.slice(pageRange.lastIndexOf('-') + 1));
		} else { fPg = lPg = doc.pages.item(pageRange); }
		spreadWidth = (target.constructor.name === 'Spreads' ? lPg.bounds[3] : fPg.bounds[3]) - fPg.bounds[1];
		if (spreadWidth < UnitValue('335 pt').as('mm')) app.pdfExportPreferences.pageInformationMarks = false;

		// Export
		doc.exportFile(ExportFormat.PDF_TYPE, File(filename), false);
	}
}

function readSettings() {
	try {
		settings = $.evalFile(settingsFile);
		if (settings.version === undefined || settings.version !== VER) setDefaults();
	} catch (e) { setDefaults(); }

	// Preset
	ui.preset1.isOn.value = settings.presets.preset1.active;
	ui.preset1.preset.selection = findPresetIndex(settings.presets.preset1.name, ui.preset1.preset.items);
	// Options
	ui.preset1.dpi.text = Number(settings.presets.preset1.dpi.replace(/[^\d.,]/gi, '').replace(',', '.'));
	if (isNaN(ui.preset1.dpi.text) || ui.preset1.dpi.text < 9 || ui.preset1.dpi.text > 2400)
		ui.preset1.dpi.text = '300';
	ui.preset1.suffix.text = settings.presets.preset1.suffix;
	ui.preset1.asSpreads.value = settings.presets.preset1.options.spreads;
	ui.preset1.cropMarks.value = settings.presets.preset1.options.marks.crop;
	ui.preset1.pageInfo.value = settings.presets.preset1.options.marks.info;
	ui.preset1.bleedCustom.value = settings.presets.preset1.options.bleed.custom;
	ui.preset1.bleedValue.text =
		Number(settings.presets.preset1.options.bleed.value.replace(/[^\d.,]/gi, '').replace(',', '.'));
	if (isNaN(ui.preset1.bleedValue.text) || UnitValue(ui.preset1.bleedValue.text, 'mm').as('pt') > 72)
		ui.preset1.bleedValue.text = '3';
	ui.preset1.slug.value = settings.presets.preset1.options.slug;
	// Script
	ui.preset1.script.path = File(settings.presets.preset1.script.file).exists ?
		File(settings.presets.preset1.script.file) : '';
	if (ui.preset1.script.path) {
		ui.preset1.script.file.text = decodeURI(ui.preset1.script.path.name);
		ui.preset1.script.file.helpTip =
			WIN ? decodeURI(ui.preset1.script.path.fsName) : decodeURI(ui.preset1.script.path.fullName);
	}
	ui.preset1.script.isOn.value = !!ui.preset1.script.path && settings.presets.preset1.script.active;

	// Preset
	ui.preset2.isOn.value = settings.presets.preset2.active;
	ui.preset2.preset.selection = findPresetIndex(settings.presets.preset2.name, ui.preset2.preset.items);
	// Options
	ui.preset2.dpi.text = Number(settings.presets.preset2.dpi.replace(/[^\d.,]/gi, '').replace(',', '.'));
	if (isNaN(ui.preset2.dpi.text) || ui.preset2.dpi.text < 9 || ui.preset2.dpi.text > 2400)
		ui.preset2.dpi.text = '300';
	ui.preset2.suffix.text = settings.presets.preset2.suffix;
	ui.preset2.asSpreads.value = settings.presets.preset2.options.spreads;
	ui.preset2.cropMarks.value = settings.presets.preset2.options.marks.crop;
	ui.preset2.pageInfo.value = settings.presets.preset2.options.marks.info;
	ui.preset2.bleedCustom.value = settings.presets.preset2.options.bleed.custom;
	ui.preset2.bleedValue.text =
		Number(settings.presets.preset2.options.bleed.value.replace(/[^\d.,]/gi, '').replace(',', '.'));
	if (isNaN(ui.preset2.bleedValue.text) || UnitValue(ui.preset2.bleedValue.text, 'mm').as('pt') > 72)
		ui.preset2.bleedValue.text = '3';
	ui.preset2.slug.value = settings.presets.preset2.options.slug;
	// Script
	ui.preset2.script.path = File(settings.presets.preset2.script.file).exists ?
		File(settings.presets.preset2.script.file) : '';
	if (ui.preset2.script.path) {
		ui.preset2.script.file.text = decodeURI(ui.preset2.script.path.name);
		ui.preset2.script.file.helpTip =
			WIN ? decodeURI(ui.preset2.script.path.fsName) : decodeURI(ui.preset2.script.path.fullName);
	}
	ui.preset2.script.isOn.value = !!ui.preset2.script.path && settings.presets.preset2.script.active;

	// Output options
	ui.output.dest.folder.text = settings.output.dest.folder;
	ui.output.dest.isOn.value = settings.output.dest.active;
	ui.output.options.subfolders.value = settings.output.options.subfolders;
	ui.output.options.split.value = settings.output.options.split;
	ui.output.options.updateLinks.value = settings.output.options.updatelinks;
	ui.output.options.docSave.isOn.value = settings.output.options.save;
	ui.output.options.docSaveAs.value = false;
	ui.output.options.docClose.value = settings.output.options.close;

	// Init
	ui.preset1.isOn.onClick();
	ui.preset2.isOn.onClick();
	ui.output.dest.isOn.onClick();
	ui.output.options.docSave.isOn.onClick();
	updateOKStatus();

	function findPresetIndex(/*string*/presetName, /*array*/presetsArray) {
		if (app.pdfExportPresets.itemByName(presetName).isValid) {
		for (var i = 0, n = presetsArray.length; i < n; i++)
			if (presetsArray[i].toString() === presetName) return presetsArray[i].index;
		}
		return 0;
	}
}

function saveSettings() {
	settings = {
		presets: {
			preset1: {
				active: ui.preset1.isOn.value,
				name: ui.preset1.preset.selection.text,
				dpi: ui.preset1.dpi.text,
				suffix: ui.preset1.suffix.text,
				options: {
					spreads: ui.preset1.asSpreads.value,
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
				dpi: ui.preset2.dpi.text,
				suffix: ui.preset2.suffix.text,
				options: {
					spreads: ui.preset2.asSpreads.value,
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
				updatelinks: ui.output.options.updateLinks.value,
				save: ui.output.options.docSave.isOn.value,
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

function setDefaults() {
	try { settingsFile.remove(); } catch (e) {}
	settings = defaults;
	alert('Preferences were reset.\nEither the file was an old version, or it was corrupt.');
}

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

function zeroPad(/*number*/number, /*number*/digits) {
	number = number.toString();
	while (number.length < digits) number = '0' + number;
	return Number(number);
}

// https://stackoverflow.com/questions/2802341/javascript-natural-sort-of-alphanumerical-strings/2802804#2802804
function naturalSorter(as, bs) {
	var a, b, a1, b1, n, L;
	var i = 0;
	var rx = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
	if (as === bs) return 0;
	a = as.toString().toLowerCase().match(rx);
	b = bs.toString().toLowerCase().match(rx);
	L = a.length;
	while (i < L) {
		if (!b[i]) return 1;
		a1 = a[i];
		b1 = b[i++];
		if (a1 !== b1) {
			n = a1 - b1;
			if (!isNaN(n)) return n;
			return a1 > b1 ? 1 : -1;
		}
	}
	return b[i] ? -1 : 0;
}

function cleanupAndExit() {
	app.scriptPreferences.measurementUnit = old.measurementUnit;
	app.scriptPreferences.userInteractionLevel = old.userInteractionLevel;
	app.pdfExportPreferences.viewPDF = old.viewPDF;
	try { progressBar.close(); } catch (e) {}
	if (errors.length > 0) report(errors, 'Errors', false, true);
	exit();
}
