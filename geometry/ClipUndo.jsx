/*
	Undo clipping v1.4.0
	© October 2020, Paul Chiorean
	Restores objects clipped in a "<clip frame>" by the "FitTo" scripts.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var obj, items = doc.selection.length == 0 ?
	doc.pageItems.everyItem().getElements() : doc.selection;
while (obj = items.shift()) UndoClip(obj);


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