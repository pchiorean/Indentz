/*
	Undo fitting v1.2.0
	© August 2020, Paul Chiorean
	Restores objects clipped in "\<clip group\>" by the "fit" scripts.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var item, items = doc.selection.length == 0 ?
	doc.pageItems.everyItem().getElements() : doc.selection;
while (item = items.shift()) UndoFit(item);


function UndoFit(item) { // Undo if already clipped
	if ((item.label == "<clip group>" || item.name == "<clip group>") &&
		item.pageItems.length == 0 ) { item.label = ""; item.name = "" };
	if (item.label == "<clip group>" && item.pageItems[0].isValid) {
		var itemD = item.pageItems[0].duplicate();
		itemD.sendToBack(item); item.remove(); app.select(itemD);
		return;
	}
}