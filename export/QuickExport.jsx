/*
	Quick export v0.9 beta (2021-05-09)
	Paul Chiorean (jpeg@basement.ro)

	Exports open documents with several configurable PDF presets.

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

if (app.documents.length == 0) exit();

var defaults = {
	preset1: { name: "", suffix: "", active: true },
	preset2: { name: "", suffix: "", active: false },
	script: { file: "", active: false },
	output: {
		dest: { folder: "", active: false },
		options: { subfolders: true, overwrite: false, save: true, close: true },
	},
	savePrefs: true
};
var settings;
var settingsFile = File(app.activeScript.path + "/" +
	app.activeScript.name.substr(0, app.activeScript.name.lastIndexOf(".")) + ".prefs");
var old = {
	userInteractionLevel: app.scriptPreferences.userInteractionLevel,
	viewPDF: app.pdfExportPreferences.viewPDF,
};
var presets = app.pdfExportPresets.everyItem().name.sort();

// User interface
var ui = new Window('dialog { text: "Quick Export", orientation: "row", alignChildren: [ "fill", "top" ] }');
ui.main = ui.add('group { orientation: "column", alignChildren: [ "fill", "center" ] }');
// -- Presets and suffixes
ui.presets = ui.main.add('panel { orientation: "column", alignChildren: [ "left", "center" ], \
	spacing: 10, margins: [ 10, 15, 10, 10 ], text: "Presets and suffixes" }');
ui.presets.export1 = ui.presets.add('group { orientation: "row", alignChildren: [ "left", "bottom" ] }');
ui.presets.export1.isActive = ui.presets.export1.add('checkbox');
ui.presets.export1.preset = ui.presets.export1.add('dropdownlist', undefined, presets);
ui.presets.export1.preset.preferredSize.width = 312;
ui.presets.export1.suffix = ui.presets.export1.add('edittext { preferredSize: [ 100, -1 ] }');
ui.presets.export1.suffix.helpTip = "Append to the file name";
ui.presets.export2 = ui.presets.add('group { orientation: "row", alignChildren: [ "left", "bottom" ] }');
ui.presets.export2.isActive = ui.presets.export2.add('checkbox');
ui.presets.export2.preset = ui.presets.export2.add('dropdownlist', undefined, presets);
ui.presets.export2.preset.preferredSize.width = 312;
ui.presets.export2.suffix = ui.presets.export2.add('edittext { preferredSize: [ 100, -1 ] }');
ui.presets.export2.suffix.helpTip = "Append to the file name";
// -- Output options
ui.output = ui.main.add('panel { orientation: "column", alignChildren: [ "left", "center" ], \
	spacing: 10, margins: [ 10, 15, 10, 10 ], text: "Output" }');
ui.output.dest = ui.output.add('group { orientation: "row", alignChildren: [ "left", "bottom" ] }');
ui.output.dest.isActive = ui.output.dest.add('checkbox');
ui.output.dest.folder = ui.output.dest.add('edittext { preferredSize: [ 312, -1 ] }');
ui.output.dest.folder.helpTip = "Leave empty or disable for the current folder";
ui.output.dest.browse = ui.output.dest.add('button { text: "Browse", preferredSize: [ 100, 24 ] }');
ui.output.options = ui.output.add('group { orientation: "column", alignChildren: [ "left", "center" ], \
	spacing: 5, margins: [ 0, 10, 0, 0 ] }');
ui.output.options1 = ui.output.options.add('group { orientation: "row" }');
ui.output.options2 = ui.output.options.add('group { orientation: "row" }');
ui.output.options.subfolders =
	ui.output.options1.add('checkbox { text: "Export in subfolders", preferredSize: [ 200, -1 ] }');
ui.output.options.subfolders.helpTip = "Use 'suffix' fields as subfolders";
ui.output.options.docSave = ui.output.options1.add('checkbox { text: "Save and ..." }');
ui.output.options.fileOverwrite =
	ui.output.options2.add('checkbox { text: "Overwrite existing files", preferredSize: [ 200, -1 ] }');
ui.output.options.docClose = ui.output.options2.add('checkbox { text: "Close exported documents" }');
// -- Actions
ui.actions = ui.add('group { orientation: "column", alignChildren: [ "left", "center" ] }');
ui.actions.ok = ui.actions.add('button { text: "Start", properties: { name: "ok" }}');
ui.actions.cancel = ui.actions.add('button { text: "Cancel", properties: { name: "cancel" }}');
ui.actions.saveSettings = ui.actions.add('checkbox { text: "Save prefs" }');
// UI functions
ui.presets.export1.isActive.onClick = function() {
	ui.presets.export1.preset.enabled = ui.presets.export1.suffix.enabled = ui.presets.export1.isActive.value;
	ui.actions.ok.enabled = (ui.presets.export1.isActive.value || ui.presets.export2.isActive.value);
};
ui.presets.export2.isActive.onClick = function() {
	ui.presets.export2.preset.enabled = ui.presets.export2.suffix.enabled = ui.presets.export2.isActive.value;
	ui.actions.ok.enabled = (ui.presets.export1.isActive.value || ui.presets.export2.isActive.value);
};
ui.presets.export1.preset.onChange = function() {
	var str = ui.presets.export1.preset.selection.text;
	if (/_/g.test(str)) ui.presets.export1.suffix.text = str.substr(str.lastIndexOf("_"));
	else { ui.presets.export1.suffix.text = "" };
};
ui.presets.export2.preset.onChange = function() {
	var str = ui.presets.export2.preset.selection.text;
	if (/_/g.test(str)) ui.presets.export2.suffix.text = str.substr(str.lastIndexOf("_"));
	else { ui.presets.export2.suffix.text = "" };
};
ui.presets.export1.suffix.onChange = function() {
	var str = ui.presets.export1.suffix.text.replace(/^\s+/, '').replace(/\s+$/, ''); // Trim
	str = str.replace(/[\/\\?|%*:"<>\[\]\.]/, ''); // Remove periods/illegal characters
	if (ui.presets.export1.suffix.text != str) ui.presets.export1.suffix.text = str;
};
ui.presets.export2.suffix.onChange = function() {
	var str = ui.presets.export2.suffix.text.replace(/^\s+/, '').replace(/\s+$/, ''); // Trim
	str = str.replace(/[\/\\?|%*:"<>\[\]\.]/, ''); // Remove periods/illegal characters
	if (ui.presets.export2.suffix.text != str) ui.presets.export2.suffix.text = str;
};
ui.output.dest.isActive.onClick = function() {
	ui.output.dest.folder.enabled = ui.output.dest.browse.enabled = ui.output.dest.isActive.value;
};
ui.output.dest.browse.onClick = function() {
	var newFolder = Folder.selectDialog("Select a folder:");
	if (!!newFolder) ui.output.dest.folder.text = decodeURI(newFolder.fullName);
};
ui.onShow = function() { ReadSettings() };

// Processing
if (ui.show() == 2) exit();
if (ui.actions.saveSettings.value) SaveSettings();
// Sort opened documents
var doc, docs = app.documents.everyItem().getElements(), names = [];
while (doc = docs.shift()) names.push(doc.name); names.sort();
var name, docs = [], pbWidth = 50;
while (name = names.shift()) {
	docs.push(app.documents.itemByName(name));
	pbWidth = Math.max(pbWidth, name.length); // While we are here, find the longest name
};
var progressBar = new ProgressBar("Exporting", pbWidth + 10);
progressBar.reset(docs.length);
var counter = 1, err = false;
var doc; while (doc = docs.shift()) {
	if (!doc.saved) { err = true; continue };
	// Base folder
	var baseFolder = decodeURI(doc.filePath);
	if (ui.output.dest.isActive.value && !!ui.output.dest.folder.text) {
		if (!Folder(ui.output.dest.folder.text).exists)
			 Folder(ui.output.dest.folder.text).create();
		baseFolder = ui.output.dest.folder.text;
	};
	for (var i = 0, preset; i < ui.presets.children.length; i++) {
		if (!ui.presets.children[i].isActive.value) continue;
		var preset = app.pdfExportPresets.item(String(ui.presets.children[i].preset.selection));
		// Suffix
		var suffix = !!ui.presets.children[i].suffix.text ?
			("_" + ui.presets.children[i].suffix.text.replace(/^_/, "")) : "";
		// Subfolder
		var subfolder = "";
		if (ui.output.options.subfolders.value && !!suffix) {
			subfolder = suffix.replace(/^_/, "");
			if (!Folder(baseFolder + "/" + subfolder).exists)
				 Folder(baseFolder + "/" + subfolder).create();
		};
		// PDF name
		var pdfBaseName = decodeURI(doc.name).replace(/\.indd$/i, "") + suffix;
		var pdfName = pdfBaseName + ".pdf";
		var folder = baseFolder + (!!subfolder ? "/" + subfolder : "");
		var file = folder + "/" + pdfName;
		// Unique name
		if (!ui.output.options.fileOverwrite.value) {
			// Get last index
			var baseRE = RegExp("^" + pdfBaseName + (!!suffix ? "[ _-]*" : "[ _-]+") + "\\d+.*.pdf$", "i");
			var idxRE = RegExp("^" + pdfBaseName + (!!suffix ? "[ _-]*" : "[ _-]+") +
				"(\\d+)([ _-]*v *\\d*)?([ _-]*copy *\\d*)?([ _-]*v *\\d*)?$", "i");
			var pdfFiles = Folder(folder).getFiles(function(f) {
				if (!/\.pdf$/i.test(f)) return false;
				return baseRE.test(decodeURI(f.name));
			});
			for (var j = 0, maxIndex = 0; j < pdfFiles.length; j++) {
				var n = idxRE.exec(decodeURI(pdfFiles[j].name).replace(/\.pdf$/i, ""));
				if (!!n) maxIndex = Math.max(maxIndex, Number(n[1]));
			};
			if (maxIndex == 0) {
				if (File(file).exists) file = file.replace(/\.pdf$/i, "") + (!!suffix ? "": " ") + "2.pdf";
			} else {
				maxIndex++;
				file = file.replace(/\.pdf$/i, "") + (!!suffix ? "": " ") + String(maxIndex) + ".pdf";
			};
		};
		// Export PDF
		progressBar.update(counter, (baseFolder == decodeURI(doc.filePath) ? decodeURI(File(file).name) : file));
		app.pdfExportPreferences.pageRange = ""; // Reset page range
		if (!ui.output.options.fileOverwrite.value && File(file).exists) {
			alert("Attempted illegal overwrite.\nBetter quit than sorry..."); exit() };
		doc.exportFile(ExportFormat.PDF_TYPE, File(file), false, preset);
	};
	counter++;
	if (ui.output.options.docSave.value && doc.saved && doc.modified) doc.save();
	if (ui.output.options.docClose.value) doc.close(SaveOptions.NO);
};
progressBar.close();
app.scriptPreferences.userInteractionLevel = old.userInteractionLevel;
app.pdfExportPreferences.viewPDF = old.viewPDF;
if (err) alert ("Untitled documents were skipped.");


function ReadSettings() {
	try { // Saved settings
		settings = $.evalFile(settingsFile);
	} catch (_) { // Defaults
		try { settingsFile.remove() } catch (_) {};
		settings = defaults;
		settingsFile.open('w');
		settingsFile.write(settings.toSource());
		settingsFile.close();
	};
	ui.presets.export1.preset.selection = FindPreset(settings.preset1.name, ui.presets.export1.preset.items);
	ui.presets.export1.suffix.text = settings.preset1.suffix;
	ui.presets.export1.isActive.value = settings.preset1.active;
	ui.presets.export2.preset.selection = FindPreset(settings.preset2.name, ui.presets.export2.preset.items);
	ui.presets.export2.suffix.text = settings.preset2.suffix;
	ui.presets.export2.isActive.value = settings.preset2.active;
	ui.output.dest.folder.text = Folder(settings.output.dest.folder).exists ? settings.output.dest.folder : "";
	ui.output.dest.isActive.value = settings.output.dest.active;
	ui.output.options.subfolders.value = settings.output.options.subfolders;
	ui.output.options.fileOverwrite.value = settings.output.options.overwrite;
	ui.output.options.docSave.value = settings.output.options.save;
	ui.output.options.docClose.value = settings.output.options.close;
	ui.actions.saveSettings.value = settings.savePrefs;
	ui.presets.export1.isActive.onClick();
	ui.presets.export2.isActive.onClick();
	ui.output.dest.isActive.onClick();
	function FindPreset(name, array) {
		if (!app.pdfExportPresets.itemByName(name).isValid) return 0;
		for (var i = 0; i < array.length; i++)
			if (array[i].toString() == name) return array[i].index;
	};
};

function SaveSettings() {
	settings = {
		preset1: {
			name: ui.presets.export1.preset.selection.text,
			suffix: ui.presets.export1.suffix.text,
			active: ui.presets.export1.isActive.value
		},
		preset2: {
			name: ui.presets.export2.preset.selection.text,
			suffix: ui.presets.export2.suffix.text,
			active: ui.presets.export2.isActive.value
		},
		script: {
			// file: ui.script.file.text,
			// active: ui.script.isActive
			file: "",
			active: false
		},
		output: {
			dest: {
				folder: ui.output.dest.folder.text,
				active: ui.output.dest.isActive.value
			},
			options: {
				subfolders: ui.output.options.subfolders.value,
				overwrite: ui.output.options.fileOverwrite.value,
				save: ui.output.options.docSave.value,
				close: ui.output.options.docClose.value
			},
		},
		savePrefs: ui.actions.saveSettings.value
	};
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
		pb.text = title + " - " + val + "/" + pb.bar.maxvalue;
		pb.show(); pb.update();
	};
	this.hide = function() { pb.hide() };
	this.close = function() { pb.close() };
};
