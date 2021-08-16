/*
	Quick export v2.10.2 (2021-08-16)
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

// Initialisation
var folderMode = (app.documents.length == 0);
var script = function() { try { return app.activeScript } catch(e) { return new File(e.fileName) } }();
var settings, settingsFile = File(Folder.userData + "/" +
	script.name.slice(0, script.name.lastIndexOf(".")) + ".prefs");
var presets = app.pdfExportPresets.everyItem().name.sort();
var old = {
	measurementUnit: app.scriptPreferences.measurementUnit,
	userInteractionLevel: app.scriptPreferences.userInteractionLevel,
	viewPDF: app.pdfExportPreferences.viewPDF,
};
app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALERTS;
app.pdfExportPreferences.viewPDF = false;
const forbiddenFilenameChars = /[#%^{}\\<>*?\/$!'":@`|=]/g;
const ADV = ScriptUI.environment.keyboardState.altKey;
const WIN = (File.fs == "Windows");
const VER = "2";

var defaults = {
	presets: {
		preset1: {
			active: true,
			name: "_preview",
			suffix: "_preview",
			options: {
				spreads: true,
				marks: { crop: true, info: false, },
				bleed: { custom: false, value: "3", },
				slug: false,
			},
			script: {
				active: false,
				file: "",
			},
		},
		preset2: {
			active: false,
			name: "_print",
			suffix: "_print",
			options: {
				spreads: false,
				marks: { crop: true, info: false, },
				bleed: { custom: false, value: "3", },
				slug: false,
			},
			script: {
				active: false,
				file: "",
			},
		},
	},
	output: {
		dest: {
			active: false,
			folder: "",
		},
		options: {
			subfolders: true,
			split: false,
			overwrite: false,
			updatelinks: true,
			save: true,
			close: true,
		},
	},
	position: "",
	version: VER,
};

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
};
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
};
ui.actions.add('button { preferredSize: [ 80, -1 ], properties: { name: "cancel" }, text: "Cancel" }');
ui.actions.ok = ui.actions.add('button { preferredSize: [ 80, -1 ], properties: { name: "ok" }, text: "Start" }');
// -- UI callback functions
ui.preset1.isOn.onClick = function() {
	ui.preset1.preset.enabled = ui.preset1.suffix.enabled = this.value;
	ui.preset1.options.enabled = this.value;
	ui.preset1.script.enabled = this.value;
	ui.preset1.bleedCustom.onClick();
	ui.preset1.script.isOn.onClick();
	if (folderMode) ui.actions.ok.enabled = (this.value || ui.preset2.isOn.value) && !!ui.input.source.path
	else ui.actions.ok.enabled = (this.value || ui.preset2.isOn.value);
};
ui.preset1.bleedCustom.onClick = function() {
	ui.preset1.bleedValue.enabled = this.value;
	if (ui.preset1.bleedValue.enabled) ui.preset1.bleedValue.onChanging();
};
ui.preset1.script.isOn.onClick = function() {
	ui.preset1.script.file.enabled = ui.preset1.script.browse.enabled = this.value;
};
ui.preset1.script.browse.onClick = function() {
	var newFile = File.openDialog("Select a script:");
	if (newFile == null && !ui.preset1.script.path) ui.preset1.script.isOn.notify();
	if (newFile.exists && (WIN ? /\.(jsx*(bin)*)$/i.test(newFile) : /\.(jsx*(bin)*|scpt)$/i.test(newFile))) {
		var f = WIN ? decodeURI(newFile.fsName) : decodeURI(newFile.fullName);
		ui.preset1.script.path = newFile;
		ui.preset1.script.file.text = decodeURI(newFile.name);
		ui.preset1.script.file.helpTip = f;
	} else {
		alert("Please select a JavaScript" + (WIN ? "" : " or AppleScript") + " file.");
		this.notify();
	};
};
ui.preset1.preset.onChange = function() {
	// Auto-set suffix
	var str = this.selection.text;
	ui.preset1.suffix.text = /_/g.test(str) && str.slice(str.lastIndexOf("_")) || "";
	// Populate preset options
	var preset = app.pdfExportPresets.item(str);
	ui.preset1.exportSpreads.value = preset.exportReaderSpreads;
	ui.preset1.cropMarks.value = preset.cropMarks;
	ui.preset1.pageInfo.value = preset.pageInformationMarks;
	ui.preset1.slug.value = preset.includeSlugWithPDF;
	ui.preset1.bleedValue.text = Math.round(preset.pageMarksOffset);
};
ui.preset2.isOn.onClick = function() {
	ui.preset2.preset.enabled = ui.preset2.suffix.enabled = this.value;
	ui.preset2.options.enabled = this.value;
	ui.preset2.script.enabled = this.value;
	ui.preset2.bleedCustom.onClick();
	ui.preset2.script.isOn.onClick();
	if (folderMode) ui.actions.ok.enabled = (this.value || ui.preset1.isOn.value) && !!ui.input.source.path
	else ui.actions.ok.enabled = (this.value || ui.preset1.isOn.value);
};
ui.preset2.bleedCustom.onClick = function() {
	ui.preset2.bleedValue.enabled = this.value;
	if (ui.preset2.bleedValue.enabled) ui.preset2.bleedValue.onChanging();
};
ui.preset1.bleedValue.onChanging =
ui.preset2.bleedValue.onChanging = function() {
	this.text = this.text.replace(/[^\d.,]/gi, "").replace(/^0/gi, "").replace(",", ".");
	if (this.text == "") this.text = "0";
	if (UnitValue(Number(this.text), "mm").as("pt") > 72 ) this.text = "25.4";
};
ui.preset1.bleedValue.onDeactivate =
ui.preset2.bleedValue.onDeactivate = function() {
	if (isNaN(this.text)) {
		alert("Invalid value.\nEnter a number between 0 and 25.4 mm.");
		this.text = "0";
	};
};
ui.preset2.script.isOn.onClick = function() {
	ui.preset2.script.file.enabled = ui.preset2.script.browse.enabled = this.value;
};
ui.preset2.script.browse.onClick = function() {
	var newFile = File.openDialog("Select a script:");
	if (newFile == null && !ui.preset2.script.path) ui.preset2.script.isOn.notify();
	if (newFile.exists && (WIN ? /\.(jsx*(bin)*)$/i.test(newFile) : /\.(jsx*(bin)*|scpt)$/i.test(newFile))) {
		var f = WIN ? decodeURI(newFile.fsName) : decodeURI(newFile.fullName);
		ui.preset2.script.path = newFile;
		ui.preset2.script.file.text = decodeURI(newFile.name);
		ui.preset2.script.file.helpTip = f;
	} else {
		alert("Please select a JavaScript" + (WIN ? "" : " or AppleScript") + " file.");
		this.notify();
	};
};
ui.preset2.preset.onChange = function() {
	// Auto-set suffix
	var str = this.selection.text;
	ui.preset2.suffix.text = /_/g.test(str) && str.slice(str.lastIndexOf("_")) || "";
	// Populate preset options
	var preset = app.pdfExportPresets.item(str);
	ui.preset2.exportSpreads.value = preset.exportReaderSpreads;
	ui.preset2.cropMarks.value = preset.cropMarks;
	ui.preset2.pageInfo.value = preset.pageInformationMarks;
	ui.preset2.slug.value = preset.includeSlugWithPDF;
	ui.preset2.bleedValue.text = Math.round(preset.pageMarksOffset);
};
ui.preset1.suffix.onChange =
ui.preset2.suffix.onChange = function() {
	var str = this.text.replace(/^\s+|\s+$/g, ""); // Trim
	str = str.replace(forbiddenFilenameChars, ""); // Sanitize suffix
	if (this.text != str) this.text = str;
};
if (folderMode) {
	ui.input.source.browse.onClick = function() {
		var newFolder = Folder.selectDialog("Select a folder:");
		if (!!newFolder) {
			var f = WIN ? decodeURI(newFolder.fsName) : decodeURI(newFolder.fullName);
			ui.input.source.path = newFolder;
			ui.input.source.folder.text = TruncatePath(f, 52);
			ui.input.source.folder.helpTip = f;
			ui.actions.ok.enabled = (ui.preset1.isOn.value || ui.preset2.isOn.value) && !!ui.input.source.path;
		};
	};
};
ui.output.dest.isOn.onClick = function() {
	ui.output.dest.folder.enabled = ui.output.dest.browse.enabled = this.value;
};
ui.output.dest.browse.onClick = function() {
	var newFolder = Folder.selectDialog("Select a folder:");
	if (newFolder == null && !ui.output.dest.path) ui.output.dest.isOn.notify();
	if (!!newFolder) {
		var f = WIN ? decodeURI(newFolder.fsName) : decodeURI(newFolder.fullName);
		ui.output.dest.path = newFolder;
		ui.output.dest.folder.text = TruncatePath(f, 48);
		ui.output.dest.folder.helpTip = f;
	};
};
if (ADV) {
	ui.actions.savePrefs.onClick = function() { SaveSettings() };
	ui.actions.resetPrefs.onClick = function() { try { settingsFile.remove() } catch (e) {}; ReadSettings() };
} else {
	ui.actions.savePrefs.onClick = function() { if (this.value) SaveSettings() };
};
ui.onShow = function() {
	ReadSettings();
	if (settings.position != null) try { ui.location = settings.position } catch (e) {};
};
ui.onClose = function() { if (ui.actions.savePrefs.value) SaveSettings() };
if (ui.show() == 2) { exit() };

// Processing
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
// -- Get a sorted document list
var name, names = [], doc, docs = [];
if (folderMode) {
	docs = ui.input.options.subfolders.value ?
		GetFilesRecursively(ui.input.source.path).sort() :
		ui.input.source.path.getFiles("*.indd").sort();
	if (docs.length == 0) { alert("No InDesign documents found."); exit() };
} else {
	docs = app.documents.everyItem().getElements();
	while (doc = docs.shift()) try { names.push(doc.fullName) } catch (e) { names.push(doc.name) }; names.sort();
	docs = []; while (name = names.shift()) docs.push(app.documents.itemByName(name));
};
// -- Init progress bar
for (var i = 0, n = docs.length, pbWidth = 50; i < n; i++) pbWidth = Math.max(pbWidth, decodeURI(docs[i].name).length);
var progressBar = new ProgressBar("Exporting", pbWidth + 10);
var maxCounter = docs.length * ((ui.preset1.isOn.value ? 1 : 0) + (ui.preset2.isOn.value ? 1 : 0));
progressBar.reset(maxCounter);
// -- Main loop
var doc, counter = 1, errors = [];
while (doc = docs.shift()) {
	if (folderMode) {
		doc = app.open(doc);
		if (doc.converted) {
			errors.push(decodeURI(doc.name) + " must be converted; skipped.");
			doc.close(SaveOptions.NO); continue;
		};
	} else {
		app.activeDocument = doc;
		if (doc.converted) { errors.push(decodeURI(doc.name) + " must be converted; skipped."); continue };
		if (!doc.saved) { errors.push(decodeURI(doc.name) + " is not saved; skipped."); continue };
	};
	// Set measurement units
	old.horizontalMeasurementUnits = doc.viewPreferences.horizontalMeasurementUnits;
	old.verticalMeasurementUnits = doc.viewPreferences.verticalMeasurementUnits;
	doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	// Get base folder
	var baseFolder = decodeURI(doc.filePath);
	if (ui.output.dest.isOn.value && !!ui.output.dest.path) {
		if (!ui.output.dest.path.exists) ui.output.dest.path.create();
		baseFolder = WIN ? decodeURI(ui.output.dest.path.fsName) : decodeURI(ui.output.dest.path.fullName);
	};
	// Check fonts
	var usedFonts = doc.fonts.everyItem().getElements();
	for (var i = 0, n = usedFonts.length; i < n; i++) {
		if (usedFonts[i].status !== FontStatus.INSTALLED) {
			errors.push(doc.name + ": Font '" + usedFonts[i].name.replace(/\t/g, " ") + "' is " +
				String(usedFonts[i].status).toLowerCase().replace("_", " "));
		};
	};
	// Update links
	if (ui.output.options.updateLinks.value) {
		for (var i = 0, n = doc.links.length; i < n; i++) {
			switch (doc.links[i].status) {
				case LinkStatus.LINK_OUT_OF_DATE:
					doc.links[i].update(); break;
				case LinkStatus.LINK_MISSING:
					errors.push(doc.name + ": Link '" + doc.links[i].name + "' not found."); break;
			};
		};
	};
	// Export
	for (var i = 1; i < 3; i++) {
		var exp = ui["preset" + i];
		if (!exp.isOn.value) continue;
		var preset = app.pdfExportPresets.item(exp.preset.selection.text);
		// Create subfolder
		var suffix = !!exp.suffix.text ? ("_" + exp.suffix.text.replace(/^_/, "")) : "";
		var subfolder = "";
		if (ui.output.options.subfolders.value && !!suffix) {
			subfolder = suffix.replace(/^_/, "");
			if (!Folder(baseFolder + "/" + subfolder).exists) Folder(baseFolder + "/" + subfolder).create();
		};
		// Run script
		if (exp.script.enabled && exp.script.isOn.value && exp.script.path.exists) {
			var ext = decodeURI(exp.script.path.fsName).slice(decodeURI(exp.script.path.fsName).lastIndexOf(".") + 1);
			var scriptLanguage = function(ext) {
				if (WIN) {
					return {
						"js": ScriptLanguage.JAVASCRIPT,
						"jsx": ScriptLanguage.JAVASCRIPT,
						"jsxbin": ScriptLanguage.JAVASCRIPT,
					}[ext];
				} else {
					return {
						"scpt": ScriptLanguage.APPLESCRIPT_LANGUAGE,
						"js": ScriptLanguage.JAVASCRIPT,
						"jsx": ScriptLanguage.JAVASCRIPT,
						"jsxbin": ScriptLanguage.JAVASCRIPT,
					}[ext];
				};
			};
			app.doScript(exp.script.path, scriptLanguage(ext), undefined, UndoModes.ENTIRE_SCRIPT, "Run script");
			app.scriptPreferences.measurementUnit = MeasurementUnits.MILLIMETERS;
			app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
		};
		// Export PDF
		if (ui.output.options.split.value) {
			var t = exp.exportSpreads.value ? doc.spreads : doc.pages;
			for (var p = 0, n = t.length; p < n; p++) {
				var baseName = decodeURI(doc.name).replace(/\.indd$/i, "");
				var fileSufx = RegExp("([ ._-])([a-zA-Z]{" + t.length + "})$", "i").exec(baseName);
				baseName = fileSufx ?
					baseName.replace(RegExp(fileSufx[0] + "$"), "") + fileSufx[1] + fileSufx[2][p] + suffix :
					baseName + "_" + ZeroPad(p+1, String(t.length).length) + suffix;
				var fn = UniqueName(baseName);
				progressBar.update(counter, (baseFolder == decodeURI(doc.filePath) ? decodeURI(File(fn).name) : fn));
				if (exp.exportSpreads.value) {
					var range = t[p].pages[0].documentOffset != t[p].pages[-1].documentOffset ?
						(String(t[p].pages[0].documentOffset + 1) + "-" + String(t[p].pages[-1].documentOffset + 1)) :
						 String(t[p].pages[0].documentOffset + 1);
				} else {
					var range = String(t[p].documentOffset + 1);
				};
				ExportPDF(fn, preset, range);
			};
		} else {
			var baseName = decodeURI(doc.name).replace(/\.indd$/i, "") + suffix;
			var fn = UniqueName(baseName);
			progressBar.update(counter, (baseFolder == decodeURI(doc.filePath) ? decodeURI(File(fn).name) : fn));
			ExportPDF(fn, preset, PageRange.ALL_PAGES);
		};
		counter++;
	};
	// Restore measurement units
	doc.viewPreferences.horizontalMeasurementUnits = old.horizontalMeasurementUnits;
	doc.viewPreferences.verticalMeasurementUnits = old.verticalMeasurementUnits;
	// Save and close
	if (ui.output.options.docSave.value && doc.saved && doc.modified) doc.save();
	if (folderMode) doc.close(SaveOptions.NO)
	else if (ui.output.options.docClose.value) doc.close(SaveOptions.NO);
};
// Finish
progressBar.close();
app.scriptPreferences.measurementUnit = old.measurementUnit;
app.scriptPreferences.userInteractionLevel = old.userInteractionLevel;
app.pdfExportPreferences.viewPDF = old.viewPDF;
if (errors.length > 0) Report(errors, "Errors", false, true);


// Functions
// --
function GetFilesRecursively(folder) {
	var files = [],
		fileList = folder.getFiles(),
		i, file;
	for (var i = 0, n = fileList.length; i < n; i++) {
		file = fileList[i];
		if (file instanceof Folder) files = files.concat(GetFilesRecursively(file));
		else if (file instanceof File && file.name.match(/\.indd$/i)) files.push(file);
	};
	return files;
};

function ExportPDF(fn, preset, range) {
	for (var key in preset) try { app.pdfExportPreferences[key] = preset[key] } catch (e) {};
	app.pdfExportPreferences.pageRange = range;
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
		), UnitValue("72 pt").as("mm"));
	} else {
		app.pdfExportPreferences.bleedTop =
		app.pdfExportPreferences.bleedBottom =
		app.pdfExportPreferences.bleedInside =
		app.pdfExportPreferences.bleedOutside = Number(exp.bleedValue.text);
		app.pdfExportPreferences.pageMarksOffset =
			Math.min(app.pdfExportPreferences.bleedTop, UnitValue("72 pt").as("mm"));
	};
	doc.exportFile(ExportFormat.PDF_TYPE, File(fn), false);
};

function UniqueName(name) {
	var pdfName = name + ".pdf";
	var folder = baseFolder + (!!subfolder ? "/" + subfolder : "");
	var fn = folder + "/" + pdfName;
	name = name.replace(/[\|\^$(.)\[\]{*+?}\\]/g, "\\$&"); // Escape regex tokens
	var baseRE = RegExp("^" + name + (!!suffix ? "[ _-]*" : "[ _-]+") + "\\d+.*.pdf$", "i");
	var indxRE = RegExp("^" + name + (!!suffix ? "[ _-]*" : "[ _-]+") +
		"(\\d+)([ _-]*v *\\d*)?([ _-]*copy *\\d*)?([ _-]*v *\\d*)?$", "i");
	var pdfFiles = Folder(folder).getFiles(function(f) {
		if (!(f instanceof File) || !/\.pdf$/i.test(f)) return false;
		return baseRE.test(decodeURI(f.name));
	});
	for (var j = 0, n = pdfFiles.length, maxIndex = 0; j < n; j++) { // Get max index
		var nn = indxRE.exec(decodeURI(pdfFiles[j].name).replace(/\.pdf$/i, ""));
		if (!!nn) maxIndex = Math.max(maxIndex, Number(nn[1]));
	};
	if (ui.output.options.overwrite.value) {
		if (maxIndex != 0) fn = fn.replace(/\.pdf$/i, "") + (!!suffix ? "" : " ") + String(maxIndex) + ".pdf";
	} else {
		if (maxIndex == 0) {
			if (File(fn).exists) fn = fn.replace(/\.pdf$/i, "") + (!!suffix ? "" : " ") + "2.pdf";
		} else {
			maxIndex++;
			fn = fn.replace(/\.pdf$/i, "") + (!!suffix ? "" : " ") + String(maxIndex) + ".pdf";
		};
	};
	return fn;
};

function TruncatePath(/*string*/path, /*number*/maxLength) {
	if (path.length > maxLength + 1) path = "\u2026" + path.slice(- maxLength + 1); // ellipsis
	return path;
};

function ZeroPad(number, digits) {
	number = number.toString();
	while (number.length < digits) number = "0" + number;
	return number;
};

function ReadSettings() {
	try {
		settings = $.evalFile(settingsFile);
		if (settings.version == undefined || settings.version != VER) SetDefaults();
	} catch (e) { SetDefaults() };
	ui.preset1.isOn.value = settings.presets.preset1.active;
	ui.preset1.preset.selection = FindPreset(settings.presets.preset1.name, ui.preset1.preset.items);
	ui.preset1.suffix.text = settings.presets.preset1.suffix;
	ui.preset1.exportSpreads.value = settings.presets.preset1.options.spreads;
	ui.preset1.cropMarks.value = settings.presets.preset1.options.marks.crop;
	ui.preset1.pageInfo.value = settings.presets.preset1.options.marks.info;
	ui.preset1.bleedCustom.value = settings.presets.preset1.options.bleed.custom;
	ui.preset1.bleedValue.text = settings.presets.preset1.options.bleed.value;
	ui.preset1.slug.value = settings.presets.preset1.options.slug;
	ui.preset1.script.path = File(settings.presets.preset1.script.file).exists ?
		File(settings.presets.preset1.script.file) : "";
	if (!!ui.preset1.script.path) {
		ui.preset1.script.file.text = decodeURI(ui.preset1.script.path.name);
		ui.preset1.script.file.helpTip =
			WIN ? decodeURI(ui.preset1.script.path.fsName) : decodeURI(ui.preset1.script.path.fullName);
	};
	ui.preset1.script.isOn.value = !!ui.preset1.script.path && settings.presets.preset1.script.active;
	ui.preset2.isOn.value = settings.presets.preset2.active;
	ui.preset2.preset.selection = FindPreset(settings.presets.preset2.name, ui.preset2.preset.items);
	ui.preset2.suffix.text = settings.presets.preset2.suffix;
	ui.preset2.exportSpreads.value = settings.presets.preset2.options.spreads;
	ui.preset2.cropMarks.value = settings.presets.preset2.options.marks.crop;
	ui.preset2.pageInfo.value = settings.presets.preset2.options.marks.info;
	ui.preset2.bleedCustom.value = settings.presets.preset2.options.bleed.custom;
	ui.preset2.bleedValue.text = settings.presets.preset2.options.bleed.value;
	ui.preset2.slug.value = settings.presets.preset2.options.slug;
	ui.preset2.script.path = File(settings.presets.preset2.script.file).exists ?
		File(settings.presets.preset2.script.file) : "";
	if (!!ui.preset2.script.path) {
		ui.preset2.script.file.text = decodeURI(ui.preset2.script.path.name);
		ui.preset2.script.file.helpTip =
			WIN ? decodeURI(ui.preset2.script.path.fsName) : decodeURI(ui.preset2.script.path.fullName);
	};
	ui.preset2.script.isOn.value = !!ui.preset2.script.path && settings.presets.preset2.script.active;
	ui.output.dest.path = Folder(settings.output.dest.folder).exists ? Folder(settings.output.dest.folder) : "";
	if (!!ui.output.dest.path) {
		var f = WIN ? decodeURI(ui.output.dest.path.fsName) : decodeURI(ui.output.dest.path.fullName);
		ui.output.dest.folder.text = TruncatePath(f, 48);
		ui.output.dest.folder.helpTip = f;
	};
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
	function FindPreset(name, array) {
		if (!app.pdfExportPresets.itemByName(name).isValid) return 0;
		for (var i = 0, n = array.length; i < n; i++) if (array[i].toString() === name) return array[i].index;
	};
};

function SetDefaults() {
	try { settingsFile.remove() } catch (e) {};
	settings = defaults;
	alert("Preferences were reset.\nEither the file was corrupt or it was an old version.");
};

function SaveSettings() {
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
						info: ui.preset1.pageInfo.value,
					},
					bleed: {
						custom: ui.preset1.bleedCustom.value,
						value: ui.preset1.bleedValue.text,
					},
					slug: ui.preset1.slug.value,
				},
				script: {
					active: ui.preset1.script.isOn.value,
					file: ui.preset1.script.path.exists ? decodeURI(ui.preset1.script.path.fullName) : "",
				},
			},
			preset2: {
				active: ui.preset2.isOn.value,
				name: ui.preset2.preset.selection.text,
				suffix: ui.preset2.suffix.text,
				options: {
					spreads: ui.preset2.exportSpreads.value,
					marks: {
						crop: ui.preset2.cropMarks.value,
						info: ui.preset2.pageInfo.value,
					},
					bleed: {
						custom: ui.preset2.bleedCustom.value,
						value: ui.preset2.bleedValue.text,
					},
					slug: ui.preset2.slug.value,
				},
				script: {
					active: ui.preset2.script.isOn.value,
					file: ui.preset2.script.path.exists ? decodeURI(ui.preset2.script.path.fullName) : "",
				},
			},
		},
		output: {
			dest: {
				active: ui.output.dest.isOn.value,
				folder: ui.output.dest.path.exists ? decodeURI(ui.output.dest.path.fullName) : "",
			},
			options: {
				subfolders: ui.output.options.subfolders.value,
				split: ui.output.options.split.value,
				overwrite: false, // ui.output.options.overwrite.value,
				updatelinks: ui.output.options.updateLinks.value,
				save: ui.output.options.docSave.value,
				close: ui.output.options.docClose.value,
			},
		},
		position: [ ui.location[0], ui.location[1] ],
		version: VER,
	};
	try {
		oldSettings = $.evalFile(settingsFile);
		if (settings.toSource() === oldSettings.toSource()) return;
	} catch (e) {};
	settingsFile.open('w');
	settingsFile.write(settings.toSource());
	settingsFile.close();
};

function ProgressBar(title, width) {
	var pb = new Window("palette", title);
	pb.bar = pb.add("progressbar", undefined, 0, undefined);
	if (!!width) { // Mini progress bar if no width
		pb.msg = pb.add("statictext", undefined, undefined, { truncate: "middle" });
		pb.msg.characters = Math.max(width, 50);
		pb.layout.layout();
		pb.bar.bounds = [ 12, 12, pb.msg.bounds[2], 24 ];
	} else pb.bar.bounds = [ 12, 12, 476, 24 ];
	this.reset = function(max) {
		pb.bar.value = 0;
		pb.bar.maxvalue = max || 0;
		pb.bar.visible = !!max;
		pb.show();
	};
	this.update = function(val, msg) {
		pb.bar.value = val;
		if (!!width) {
			pb.msg.visible = !!msg;
			!!msg && (pb.msg.text = msg);
		};
		pb.text = title + " \u2013 " + val + "/" + pb.bar.maxvalue;
		pb.show(); pb.update();
	};
	this.hide = function() { pb.hide() };
	this.close = function() { pb.close() };
};

/**
 * Simple scrollable alert inspired by this snippet by Peter Kahrel:
 * http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250
 * @param {string|string[]} message - Message to be displayed (string or array)
 * @param {string} title - Dialog title
 * @param {boolean} [showFilter] - Shows a filtering field; wildcards: '?' (any char), space and '*' (AND), '|' (OR)
 * @param {boolean} [showCompact] - Sorts message and removes duplicates
 */
function Report(message, title, showFilter, showCompact) {
	if (message instanceof Array) message = message.join("\n"); message = message.split(/\r|\n/g);
	if (showCompact && message.length > 1) {
		message = message.sort();
		for (var i = 1, l = message[0]; i < message.length; l = message[i], i++)
			if (l == message[i] || message[i] == "") { message.splice(i, 1); i-- };
	};
	var w = new Window('dialog', title);
	if (showFilter && message.length > 1) var search = w.add('edittext { characters: 40, \
		helpTip: "Wildcards: \'?\' (any character), space and \'*\' (AND), \'|\' (OR)" }');
	var list = w.add('edittext', undefined, message.join("\n"), { multiline: true, scrolling: true, readonly: true });
	w.add('button { text: "Close", properties: { name: "ok" } }');
	list.characters = function() {
		for (var i = 0, n = message.length, width = 50; i < n;
		width = Math.max(width, message[i].toString().length), i++);
		return width;
	}();
	list.minimumSize.width = 600, list.maximumSize.width = 1024;
	list.minimumSize.height = 100, list.maximumSize.height = 1024;
	w.ok.active = true;
	if (search) {
		search.onChanging = function() {
			if (this.text == "") { list.text = message.join("\n"); w.text = title; return };
			var str = this.text.replace(/[.\[\]{+}]/g, "\\$&"); // Pass through '^*()|?'
			str = str.replace(/\?/g, "."); // '?' -> any character
			if (/[ *]/g.test(str)) str = "(" + str.replace(/ +|\*/g, ").*(") + ")"; // space or '*' -> AND
			str = RegExp(str, "gi");
			for (var i = 0, n = message.length, result = []; i < n; i++) {
				var line = message[i].toString().replace(/^\s+?/g, "");
				if (str.test(line)) result.push(line.replace(/\r|\n/g, "\u00b6").replace(/\t/g, "\\t"));
			};
			w.text = str + " | " + result.length + " record" + (result.length == 1 ? "" : "s");
			if (result.length > 0) { list.text = result.join("\n") } else list.text = "";
		};
	};
	w.show();
};
