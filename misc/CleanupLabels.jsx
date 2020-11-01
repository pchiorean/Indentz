/*
	Cleanup labels v1.2.0
	© October 2020, Paul Chiorean
	Removes all labels from the document.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Cleanup labels");


function main() {
	var item, items = doc.selection.length == 0 ? doc.allPageItems : doc.selection;
	while (item = items.shift()) item.label = "";
}
