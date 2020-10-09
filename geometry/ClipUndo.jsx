/*
	Undo clipping v1.2.0
	© September 2020, Paul Chiorean
	Restores objects clipped in a "\<clip frame\>" by the "fit" scripts.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var obj, items = doc.selection.length == 0 ?
	doc.pageItems.everyItem().getElements() : doc.selection;
while (obj = items.shift()) UndoFit(obj);


function UndoFit(obj) { // Undo if already clipped
	if (obj.label == "<clip group>") { obj.label = ""; obj.name = "<clip frame>"; };
	if (obj.name == "<clip group>") obj.name = "<clip frame>";
	// if (obj.name == "<clip frame>" && obj.pageItems.length == 0) obj.name = "";
	if (obj.name == "<clip frame>" && obj.pageItems[0].isValid) {
		var objD = obj.pageItems[0].duplicate();
		objD.label = obj.label;
		objD.sendToBack(obj); obj.remove(); app.select(objD);
		return;
	}
}