/*
	Quick PDF export v0.1 (2021-04-11)
	Paul Chiorean (jpeg@basement.ro)

	Exports two PDFs of the current document using hardcoded presets.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length == 0) exit();

var data = [
	{ preset: "_preview", suffix: "_preview" },
	{ preset: "_print", suffix: "_print" }
];
app.pdfExportPreferences.pageRange = ""; // Reset page range

// Sort opened documents
var doc, docs = app.documents.everyItem().getElements(), names = [];
while (doc = docs.shift()) names.push(doc.name); names.sort();
var name, docs = []; while (name = names.shift()) docs.push(app.documents.itemByName(name));

var progressBar = new ProgressBar("Exporting");
progressBar.reset(docs.length * data.length);
var counter = 1, err = false;
var doc; while (doc = docs.shift()) {
	if (doc.saved && !doc.modified) {
		for (var i = 0; i < data.length; i++) {
			progressBar.update(counter); counter++;
			ExportPDF(doc, data[i]);
		}
		doc.close();
	} else err = true;
}
progressBar.close();
if (err) alert ("Some documents were skipped.");


function ExportPDF(doc, data) {
	doc.exportFile(
		ExportFormat.PDF_TYPE,
		File(doc.fullName.toString().replace(/\.indd$/i, "") + data.suffix + ".pdf"),
		false,
		app.pdfExportPresets.itemByName(data.preset)
	);
}

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
	}
	this.update = function(val, msg) {
		pb.bar.value = val;
		if (!!width) {
			pb.msg.visible = !!msg;
			!!msg && (pb.msg.text = msg);
		}
		pb.text = title + " - " + val + "/" + pb.bar.maxvalue;
		pb.show(); pb.update();
	}
	this.hide = function() { pb.hide() }
	this.close = function() { pb.close() }
}
