/*
	Quick export v1.0 (2021-05-13)
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
	script1: { file: "", active: false },
	preset2: { name: "", suffix: "", active: false },
	script2: { file: "", active: false },
	output: {
		dest: { folder: "", active: false },
		options: { subfolders: false, updatelinks: true, overwrite: false, save: true, close: true },
	}
};
var settings;
var settingsFile = File(app.activeScript.path + "/" +
	app.activeScript.name.substr(0, app.activeScript.name.lastIndexOf(".")) + ".prefs");
var presets = app.pdfExportPresets.everyItem().name.sort();
var old = {
	userInteractionLevel: app.scriptPreferences.userInteractionLevel,
	viewPDF: app.pdfExportPreferences.viewPDF,
};
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALERTS;
app.pdfExportPreferences.pageRange = ""; // Reset page range
app.pdfExportPreferences.viewPDF = false;
const ADV = ScriptUI.environment.keyboardState.altKey;

// User interface
var ui = new Window('dialog { text: "Quick Export", orientation: "column", \
	alignChildren: [ "left", "top" ], spacing: 10, margins: 16 }');
ui.main = ui.add('group { preferredSize: [ 500, -1 ], orientation: "column", \
	alignChildren: [ "fill", "center" ], spacing: 10, margins: 0 }');
// -- Export presets / scripts
ui.presets = ui.main.add('panel { text: "Export presets", orientation: "column", \
	alignChildren: [ "left", "center" ], spacing: 10, margins: [ 10, 15, 10, 10 ] }');
	ui.presets.exp1 = ui.presets.add('group { orientation: "row", \
		alignChildren: [ "left", "center" ], spacing: 10, margins: 0 }');
		ui.presets.exp1.isActive = ui.presets.exp1.add('checkbox { alignment: "bottom" }');
		ui.presets.exp1.preset = ui.presets.exp1.add('dropdownlist', undefined, presets);
		ui.presets.exp1.preset.preferredSize.width = 290;
		ui.presets.exp1.add('statictext { text: "Suffix:", preferredSize: [ 40, -1 ], justify: "right" }');
		ui.presets.exp1.suffix = ui.presets.exp1.add('edittext { helpTip: "Append to the file name", \
			preferredSize: [ 100, -1 ] }');
	ui.presets.exp1.script = ui.presets.add('group { orientation: "row", alignChildren: [ "left", "center" ], \
		spacing: 10, margins: 0 }');
		ui.presets.exp1.script.add('statictext { text: "Run a script:", preferredSize: [ 80, -1 ] }');
		ui.presets.exp1.script.isActive = ui.presets.exp1.script.add('checkbox { alignment: "bottom" }');
		ui.presets.exp1.script.file = ui.presets.exp1.script.add('edittext { preferredSize: [ 250, -1 ], \
			properties: { readonly: true } }');
		ui.presets.exp1.script.browse = ui.presets.exp1.script.add('button { text: "Browse", \
			preferredSize: [ 100, 22 ] }');
	ui.presets.add('panel { alignment: "fill" }');
	ui.presets.exp2 = ui.presets.add('group { orientation: "row", \
		alignChildren: [ "left", "center" ], spacing: 10, margins: 0 }');
		ui.presets.exp2.isActive = ui.presets.exp2.add('checkbox { alignment: "bottom" }');
		ui.presets.exp2.preset = ui.presets.exp2.add('dropdownlist', undefined, presets);
		ui.presets.exp2.preset.preferredSize.width = 290;
		ui.presets.exp2.add('statictext { text: "Suffix:", preferredSize: [ 40, -1 ], justify: "right" }');
		ui.presets.exp2.suffix = ui.presets.exp2.add('edittext { preferredSize: [ 100, -1 ], \
			helpTip: "Append to the file name" }');
	ui.presets.exp2.script = ui.presets.add('group { orientation: "row", alignChildren: [ "left", "center" ], \
		spacing: 10, margins: 0 }');
		ui.presets.exp2.script.add('statictext { text: "Run a script:", preferredSize: [ 80, -1 ] }');
		ui.presets.exp2.script.isActive = ui.presets.exp2.script.add('checkbox { alignment: "bottom" }');
		ui.presets.exp2.script.file = ui.presets.exp2.script.add('edittext { preferredSize: [ 250, -1 ], \
			properties: { readonly: true } }');
		ui.presets.exp2.script.browse = ui.presets.exp2.script.add('button { text: "Browse", \
			preferredSize: [ 100, 22 ] }');
// -- Output options
ui.output = ui.main.add('panel { text: "Output folder and options", orientation: "column", \
	alignChildren: [ "left", "center" ] spacing: 10, margins: [ 10, 15, 10, 10 ] }');
	ui.output.dest = ui.output.add('group { orientation: "row", alignChildren: [ "left", "center" ], \
		spacing: 10, margins: 0 }');
		ui.output.dest.isActive = ui.output.dest.add('checkbox { alignment: "bottom" }');
		ui.output.dest.folder = ui.output.dest.add('edittext { preferredSize: [ 340, -1 ], \
			properties: { readonly: true } }');
		ui.output.dest.browse = ui.output.dest.add('button { text: "Browse", preferredSize: [ 100, 22 ] }');
	ui.output.options = ui.output.add('group { orientation: "row", alignChildren: [ "left", "top" ], \
		spacing: 0, margins: [ 0, 5, 0, 0 ] }');
		ui.output.opt1 = ui.output.options.add('group { preferredSize: [ 200, -1 ], orientation: "column", \
			alignChildren: [ "left", "center" ], spacing: 5, margins: 0 }');
			ui.output.options.subfolders = ui.output.opt1.add('checkbox { \
				helpTip: "Use \'suffix\' fields as subfolders", text: "Export in subfolders" }');
			ui.output.options.updateLinks = ui.output.opt1.add('checkbox { text: "Update links" }');
			ui.output.options.fileOverwrite = ui.output.opt1.add('checkbox { text: "Overwrite existing files" }');
		ui.output.opt2 = ui.output.options.add('group { orientation: "column", alignChildren: [ "left", "center" ], \
			spacing: 5, margins: 0 }');
			ui.output.options.docSave = ui.output.opt2.add('checkbox { text: "Save and ..." }');
			ui.output.options.docClose = ui.output.opt2.add('checkbox { text: "Close exported documents" }');
// -- Actions
ui.actions = ui.add('group { orientation: "row", alignChildren: [ "left", "center" ], spacing: 10, margins: 0, \
	alignment: [ "right", "center" ] }');
if (ADV) {
	ui.actions.savePrefs = ui.actions.add('button { text: "Save prefs", preferredSize: [ 80, -1 ] }');
	ui.actions.delPrefs = ui.actions.add('button { text: "Del prefs", preferredSize: [ 80, -1 ] }');
	ui.actions.add('group { preferredSize: [ 140, -1 ] }');
} else {
	ui.actions.savePrefs = ui.actions.add('checkbox { text: "Save preferences", preferredSize: [ 320, -1 ], \
		alignment: "bottom" }');
	ui.actions.savePrefs.value = true;
};
ui.actions.add('button { text: "Cancel", preferredSize: [ 80, -1 ], properties: { name: "cancel" } }');
ui.actions.ok = ui.actions.add('button { text: "Start", preferredSize: [ 80, -1 ], properties: { name: "ok" } }');

// UI callback functions
ui.presets.exp1.isActive.onClick = function() {
	ui.presets.exp1.preset.enabled = ui.presets.exp1.suffix.enabled = this.value;
	ui.presets.exp1.script.enabled = this.value;
	ui.presets.exp1.script.isActive.onClick();
	ui.actions.ok.enabled = (this.value || ui.presets.exp2.isActive.value);
};
ui.presets.exp2.isActive.onClick = function() {
	ui.presets.exp2.preset.enabled = ui.presets.exp2.suffix.enabled = this.value;
	ui.presets.exp2.script.enabled = this.value;
	ui.presets.exp2.script.isActive.onClick();
	ui.actions.ok.enabled = (ui.presets.exp1.isActive.value || this.value);
};
ui.presets.exp1.script.isActive.onClick = function() {
	ui.presets.exp1.script.file.enabled = ui.presets.exp1.script.browse.enabled = this.value };
ui.presets.exp1.script.browse.onClick = function() {
	var newFile = File.openDialog("Select a script:");
	if (newFile.exists && /\.(jsx*(bin)*|scpt)$/i.test(newFile)) {
		ui.presets.exp1.script.path = newFile;
		ui.presets.exp1.script.file.text = decodeURI(newFile.name);
		ui.presets.exp1.script.file.helpTip = decodeURI(newFile.fullName);
	} else {
		alert("Please select a JavaScript or AppleScript file.");
		this.notify();
	};
};
ui.presets.exp2.script.isActive.onClick = function() {
	ui.presets.exp2.script.file.enabled = ui.presets.exp2.script.browse.enabled = this.value };
ui.presets.exp2.script.browse.onClick = function() {
	var newFile = File.openDialog("Select a script:");
	if (newFile.exists && /\.(jsx*(bin)*|scpt)$/i.test(newFile)) {
		ui.presets.exp2.script.path = newFile;
		ui.presets.exp2.script.file.text = decodeURI(newFile.name);
		ui.presets.exp2.script.file.helpTip = decodeURI(newFile.fullName);
	} else {
		alert("Please select a JavaScript or AppleScript file.");
		this.notify();
	};
};
ui.presets.exp1.preset.onChange = function() {
	var str = this.selection.text;
	if (/_/g.test(str)) {
		ui.presets.exp1.suffix.text = str.substr(str.lastIndexOf("_"));
	} else { ui.presets.exp1.suffix.text = "" };
};
ui.presets.exp2.preset.onChange = function() {
	var str = this.selection.text;
	if (/_/g.test(str)) {
		ui.presets.exp2.suffix.text = str.substr(str.lastIndexOf("_"));
	} else { ui.presets.exp2.suffix.text = "" };
};
ui.presets.exp1.suffix.onChange = function() {
	var str = this.text.replace(/^\s+/, '').replace(/\s+$/, ''); // Trim
	str = str.replace(/[\/\\?|%*:"<>\[\]\.]/, ''); // Remove periods/illegal characters
	if (this.text != str) this.text = str;
};
ui.presets.exp2.suffix.onChange = function() {
	var str = this.text.replace(/^\s+/, '').replace(/\s+$/, ''); // Trim
	str = str.replace(/[\/\\?|%*:"<>\[\]\.]/, ''); // Remove periods/illegal characters
	if (this.text != str) this.text = str;
};
ui.output.dest.isActive.onClick = function() {
	ui.output.dest.folder.enabled = ui.output.dest.browse.enabled = this.value;
};
ui.output.dest.browse.onClick = function() {
	var newFolder = Folder.selectDialog("Select a folder:");
	// alert(ui.output.dest.folder.characters); // TODO
	if (!!newFolder) {
		ui.output.dest.path = newFolder;
		ui.output.dest.folder.text = TruncatePath(decodeURI(newFolder.fullName), 50);
		ui.output.dest.folder.helpTip = decodeURI(newFolder.fullName);
	};
};
if (ADV) {
	ui.actions.savePrefs.onClick = function() { SaveSettings() };
	ui.actions.delPrefs.onClick = function() { SetDefaults(); ReadSettings() };
} else {
	ui.actions.savePrefs.onClick = function() { if (this.value) SaveSettings() };
};
ui.onShow = function() { ReadSettings() };

// Main loop
if (ui.show() == 2) exit();
if (ui.actions.savePrefs.value) SaveSettings();
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
var counter = 1, errors = [];
var doc; while (doc = docs.shift()) {
	if (!doc.saved) { errors.push(doc.name + " has no path. Skipped."); continue };
	// Base folder
	var baseFolder = decodeURI(doc.filePath);
	if (ui.output.dest.isActive.value && !!ui.output.dest.path) {
		if (!ui.output.dest.path.exists) ui.output.dest.path.create();
		baseFolder = decodeURI(ui.output.dest.path.fullName);
	};
	for (var i = 1; i < 3; i++) {
		var exp = ui.presets["exp" + i];
		if (!exp.isActive.value) continue;
		var preset = app.pdfExportPresets.item(String(exp.preset.selection));
		// Suffix
		var suffix = !!exp.suffix.text ? ("_" + exp.suffix.text.replace(/^_/, "")) : "";
		// Subfolder
		var subfolder = "";
		if (ui.output.options.subfolders.value && !!suffix) {
			subfolder = suffix.replace(/^_/, "");
			if (!Folder(baseFolder + "/" + subfolder).exists) Folder(baseFolder + "/" + subfolder).create();
		};
		// PDF name
		var pdfBaseName = decodeURI(doc.name).replace(/\.indd$/i, "") + suffix;
		var pdfName = pdfBaseName + ".pdf";
		var folder = baseFolder + (!!subfolder ? "/" + subfolder : "");
		var file = folder + "/" + pdfName;
		// Unique name
		if (!ui.output.options.fileOverwrite.value) {
			var baseRE = RegExp("^" + pdfBaseName + (!!suffix ? "[ _-]*" : "[ _-]+") + "\\d+.*.pdf$", "i");
			var indxRE = RegExp("^" + pdfBaseName + (!!suffix ? "[ _-]*" : "[ _-]+") +
				"(\\d+)([ _-]*v *\\d*)?([ _-]*copy *\\d*)?([ _-]*v *\\d*)?$", "i");
			var pdfFiles = Folder(folder).getFiles(function(f) {
				if (!/\.pdf$/i.test(f)) return false;
				return baseRE.test(decodeURI(f.name));
			});
			for (var j = 0, maxIndex = 0; j < pdfFiles.length; j++) { // Get max index
				var n = indxRE.exec(decodeURI(pdfFiles[j].name).replace(/\.pdf$/i, ""));
				if (!!n) maxIndex = Math.max(maxIndex, Number(n[1]));
			};
			if (maxIndex == 0) {
				if (File(file).exists) file = file.replace(/\.pdf$/i, "") + (!!suffix ? "": " ") + "2.pdf";
			} else {
				maxIndex++;
				file = file.replace(/\.pdf$/i, "") + (!!suffix ? "": " ") + String(maxIndex) + ".pdf";
			};
		};
		// Processing
		app.activeDocument = doc;
		progressBar.update(counter, (baseFolder == decodeURI(doc.filePath) ? decodeURI(File(file).name) : file));
		// Update links
		for (var l = 0; l < doc.links.length; l++) {
			switch (doc.links[l].status) {
				case LinkStatus.LINK_OUT_OF_DATE:
					if (ui.output.options.updateLinks.value) link.update()
					else errors.push(doc.name + ": Link '" + doc.links[l].name + "' is out of date.");
					break;
				case LinkStatus.LINK_MISSING:
					errors.push(doc.name + ": Link '" + doc.links[l].name + "' not found.");
					break;
			};
		};
		// Run script
		if (exp.script.enabled && exp.script.isActive.value && exp.script.path.exists) {
			var ext = decodeURI(exp.script.path.fullName).substr(decodeURI(exp.script.path.fullName).lastIndexOf(".") + 1);
			var scriptLanguage = (function(ext) {
				return {
					"scpt": ScriptLanguage.APPLESCRIPT_LANGUAGE,
					"js": ScriptLanguage.JAVASCRIPT,
					"jsx": ScriptLanguage.JAVASCRIPT,
					"jsxbin": ScriptLanguage.JAVASCRIPT,
				}[ext];
			})(ext);
			app.doScript(exp.script.path,
			scriptLanguage, undefined,
			UndoModes.ENTIRE_SCRIPT, "Run script");
		};
		// Export PDF
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
if (errors.length > 0) AlertScroll("Errors", errors);

function TruncatePath(/*string*/path, maxLength) {
	if (path.length > maxLength + 3) path = "..." + path.slice(- maxLength + 3);
	return path;
};

function ReadSettings() {
	try { settings = $.evalFile(settingsFile) } catch (_) { SetDefaults() };
	ui.presets.exp1.preset.selection = FindPreset(settings.preset1.name, ui.presets.exp1.preset.items);
	ui.presets.exp1.suffix.text = settings.preset1.suffix;
	ui.presets.exp1.isActive.value = settings.preset1.active;
	ui.presets.exp1.script.path = File(settings.script1.file).exists ? File(settings.script1.file) : "";
	if (!!ui.presets.exp1.script.path) {
		ui.presets.exp1.script.file.text = decodeURI(ui.presets.exp1.script.path.name);
		ui.presets.exp1.script.file.helpTip = decodeURI(ui.presets.exp1.script.path.fullName);
	};
	ui.presets.exp1.script.isActive.value = !!ui.presets.exp1.script.path && settings.script1.active;
	ui.presets.exp2.preset.selection = FindPreset(settings.preset2.name, ui.presets.exp2.preset.items);
	ui.presets.exp2.suffix.text = settings.preset2.suffix;
	ui.presets.exp2.isActive.value = settings.preset2.active;
	ui.presets.exp2.script.path = File(settings.script2.file).exists ? File(settings.script2.file) : "";
	if (!!ui.presets.exp2.script.path) {
		ui.presets.exp2.script.file.text = decodeURI(ui.presets.exp2.script.path.name);
		ui.presets.exp2.script.file.helpTip = decodeURI(ui.presets.exp2.script.path.fullName);
	};
	ui.presets.exp2.script.isActive.value = !!ui.presets.exp2.script.path && settings.script2.active;
	ui.output.dest.path = Folder(settings.output.dest.folder).exists ? Folder(settings.output.dest.folder) : "";
	if (!!ui.output.dest.path) {
		ui.output.dest.folder.text = TruncatePath(decodeURI(ui.output.dest.path.fullName), 50);
		ui.output.dest.folder.helpTip = decodeURI(ui.output.dest.path.fullName);
	};
	ui.output.dest.isActive.value = !!ui.output.dest.path && settings.output.dest.active;
	ui.output.options.subfolders.value = settings.output.options.subfolders;
	ui.output.options.updateLinks.value = settings.output.options.updatelinks;
	ui.output.options.fileOverwrite.value = settings.output.options.overwrite;
	ui.output.options.docSave.value = settings.output.options.save;
	ui.output.options.docClose.value = settings.output.options.close;
	ui.presets.exp1.isActive.onClick();
	ui.presets.exp1.script.isActive.onClick();
	ui.presets.exp2.isActive.onClick();
	ui.presets.exp2.script.isActive.onClick();
	ui.output.dest.isActive.onClick();
	function FindPreset(name, array) {
		if (!app.pdfExportPresets.itemByName(name).isValid) return 0;
		for (var i = 0; i < array.length; i++) if (array[i].toString() == name) return array[i].index;
	};
};

function SetDefaults() {
	try { settingsFile.remove() } catch (_) {};
	settings = defaults;
};

function SaveSettings() {
	settings = {
		preset1: {
			name: ui.presets.exp1.preset.selection.text,
			suffix: ui.presets.exp1.suffix.text,
			active: ui.presets.exp1.isActive.value
		},
		script1: {
			file: decodeURI(ui.presets.exp1.script.path.fullName),
			active: ui.presets.exp1.script.isActive.value
		},
		preset2: {
			name: ui.presets.exp2.preset.selection.text,
			suffix: ui.presets.exp2.suffix.text,
			active: ui.presets.exp2.isActive.value
		},
		script2: {
			file: decodeURI(ui.presets.exp2.script.path.fullName),
			active: ui.presets.exp2.script.isActive.value
		},
		output: {
			dest: {
				folder: decodeURI(ui.output.dest.path.fullName),
				active: ui.output.dest.isActive.value
			},
			options: {
				subfolders: ui.output.options.subfolders.value,
				updatelinks: ui.output.options.updateLinks.value,
				overwrite: ui.output.options.fileOverwrite.value,
				save: ui.output.options.docSave.value,
				close: ui.output.options.docClose.value
			},
		}
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

// Modified from 'Scrollable alert' by Peter Kahrel
// http://forums.adobe.com/message/2869250#2869250
function AlertScroll(title, input) {
	if (input instanceof Array) input = input.join("\r");
	var lines = input.split(/\r|\n/g);
	var w = new Window("dialog", title);
	var list = w.add("edittext", undefined, input,
		{ multiline: true, scrolling: true, readonly: true });
	list.characters = (function() {
		for (var i = 0, width = 50; i < lines.length; i++)
			width = Math.max(width, lines[i].length);
		return width;
	})();
	list.minimumSize.width = 100; list.maximumSize.width = 1024;
	list.minimumSize.height = 100; list.maximumSize.height = 1024;
	w.add("button", undefined, "Close", { name: "ok" });
	w.ok.active = true;
	w.show();
};
