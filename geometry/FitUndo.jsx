/*
	Undo fitting v1.1.0
	© July 2020, Paul Chiorean
	Restores objects clipped in "\<clip group\>" by the "fit" scripts.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
var scope = sel.length == 0 ? doc.pageItems : sel;
for (var i = 0; i < scope.length; i++) {
	var obj = scope[i], page;
	if (page = obj.parentPage) UndoFit(obj);
}


function UndoFit(obj) { // Undo if already clipped
	if ((obj.label == "<clip group>" || obj.name == "<clip group>") &&
		obj.pageItems.length == 0 ) { obj.label = ""; obj.name = "" };
	if (obj.label == "<clip group>" && obj.pageItems[0].isValid) {
		var objD = obj.pageItems[0].duplicate();
		objD.sendToBack(obj); obj.remove(); app.select(objD);
		return;
	}
}