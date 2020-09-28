/*
	Clip v1.0.0
	© September 2020, Paul Chiorean
	Clip selected objects in a "\<clip frame\>", or restores them
*/

if (app.documents.length == 0) exit();
var items, obj;

	var items, obj, page;
	if ((items = app.activeDocument.selection).length > 0) {
		while (obj = items.shift()) {
			if (page = obj.parentPage) obj = Fit2Bounds(obj, page);
		}
	}

function Fit2Bounds(obj, page) {
	// Undo if already clipped
	if (obj.name == "<clip frame>" && obj.pageItems[0].isValid) {
		var objD = obj.pageItems[0].duplicate();
		objD.label = obj.label;
		objD.sendToBack(obj); obj.remove(); app.select(objD);
		return obj;
	}
	// Compute bounds
	var objBounds = obj.visibleBounds;
	var size = [
		objBounds[2] > page.bounds[0] ? Math.max(objBounds[0], page.bounds[0]) : objBounds[0], // top
		objBounds[3] > page.bounds[1] ? Math.max(objBounds[1], page.bounds[1]) : objBounds[1], // left
		objBounds[0] < page.bounds[2] ? Math.min(objBounds[2], page.bounds[2]) : objBounds[2], // bottom
		objBounds[1] < page.bounds[3] ? Math.min(objBounds[3], page.bounds[3]) : objBounds[3]  // right
	];
	// Clip!
	var frame = page.rectangles.add(
		obj.itemLayer,
		LocationOptions.AFTER, obj,
		{
			name: "<clip frame>", label: obj.label,
			fillColor: "None", strokeColor: "None",
			geometricBounds: size
		}
	);
	frame.sendToBack(obj); app.select(obj); app.cut(); app.select(frame); app.pasteInto();
	obj = frame; return obj;
}
