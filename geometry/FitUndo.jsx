/*
	Undo fitting v1.0.0
	© July 2020, Paul Chiorean
	This script restores objects clipped in "<clip group>" by the "fit" scripts.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}
// Resize selected object(s)
for (var i = 0; i < sel.length; i++) {
	var obj = sel[i], page;
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