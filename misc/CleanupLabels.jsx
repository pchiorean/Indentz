/*
	Cleanup labels v1.2.1
	© November 2020, Paul Chiorean
	Removes all labels from the document.
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Cleanup labels");


function main() {
	var item, items = doc.selection.length == 0 ? doc.allPageItems : doc.selection;
	while (item = items.shift()) item.label = "";
}
