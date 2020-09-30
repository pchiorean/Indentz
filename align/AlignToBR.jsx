/*
	Align to bottom-right v2.2.0
	© September 2020, Paul Chiorean
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

var sel = doc.selection, selBAK = sel, obj;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit() }
if (sel.length == 1 && sel[0].locked) { alert("This object is locked."); exit() }

var set_ADB = app.alignDistributePreferences.alignDistributeBounds;

// If we have a key object, align all to that and exit
if (doc.selectionKeyObject != undefined) {
	set_ADB = AlignDistributeBounds.KEY_OBJECT;
	Align(sel, doc.selectionKeyObject);
	exit();
}
// Remember layers for grouping/ungrouping
var set_URL = app.generalPreferences.ungroupRemembersLayers;
var set_PRL = app.clipboardPreferences.pasteRemembersLayers;
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;
// Filter selection and get a single object
if (sel.length > 1) {
	var objArray = [];
	for (var i = 0; i < sel.length; i++) {
		if (sel[i].locked) { alert("Locked objects will remain in place."); continue }
		objArray.push(sel[i]);
	}
	obj = doc.groups.add(objArray);
	obj.name = "<align group>";
} else obj = sel[0];
// Align, ungroup and restore initial selection (sans key object)
if (set_ADB == AlignDistributeBounds.ITEM_BOUNDS) {
	alert("Align to what?") } else Align(obj);
if (obj.name == "<align group>") obj.ungroup();
app.select(selBAK);
// Restore layer grouping settings
app.generalPreferences.ungroupRemembersLayers = set_URL;
app.clipboardPreferences.pasteRemembersLayers = set_PRL;

function Align(obj, selKO) {
	doc.align(obj, AlignOptions.BOTTOM_EDGES, set_ADB, selKO);
	doc.align(obj, AlignOptions.RIGHT_EDGES, set_ADB, selKO);
}
