/*
	Undo clipping v1.5.0
	© October 2020, Paul Chiorean
	Restores objects clipped in a "<clip frame>" by the "FitTo" scripts.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var items = doc.selection.length == 0 ?
	doc.pageItems.everyItem().getElements() : doc.selection;

var set_URL = app.generalPreferences.ungroupRemembersLayers;
var set_PRL = app.clipboardPreferences.pasteRemembersLayers;
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;

app.doScript(
	main, ScriptLanguage.javascript, items,
	UndoModes.FAST_ENTIRE_SCRIPT, "Unclipping"
);

app.generalPreferences.ungroupRemembersLayers = set_URL;
app.clipboardPreferences.pasteRemembersLayers = set_PRL;


function main(items) {
	var obj;
	while (obj = items.shift()) UndoClip(obj);
	app.select(null);
}

function UndoClip(obj) {
	if (obj.name == "<clip frame>" && obj.pageItems[0].isValid) {
		var objD = obj.pageItems[0].duplicate();
		objD.label = obj.label;
		objD.sendToBack(obj); obj.remove(); obj = objD; app.select(obj);
		if (obj.name == "<clip group>") {
			var sel_BAK = obj.pageItems.everyItem().getElements();
			obj.ungroup(); app.select(sel_BAK);
		}
	}
}