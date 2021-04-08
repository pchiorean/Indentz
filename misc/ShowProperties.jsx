/*
	Show properties 1.3.1 (2021-04-08)
	Paul Chiorean (jpeg@basement.ro)

	Shows properties and methods of a selected object.

	Modified from https://github.com/grefel/indesignjs/blob/version2/Allgemeine_Skripte/
	EigenschaftenAnzeigen.jsx by Gregor Fellenz (grefel).
*/

if (app.documents.length > 0 && app.selection.length > 0) {
	obj = app.selection[0];
} else if (app.documents.length > 0) {
	alert("Nothing is selected.\nThe properties and methods of the document are displayed.")
	obj = app.documents[0];
} else {
	alert("Nothing is selected.\nThe properties and methods of the application are displayed.")
	obj = app;
}
ShowProps(obj);


function ShowProps(obj) {
	var result = [];
	// Object
	result.push('OBJECT:\r');
	result.push(obj.reflect.name);
	result.push(obj.toSource());
	// Properties
	result.push('\rPROPERTIES:\r');
	var props = obj.reflect.properties.sort();
	for (var i = 0; i < props.length; i++) {
		if (props[i].toString() === "__proto__" ||
			props[i].toString() === "reflect" ||
			props[i].toString() === "properties") continue;
		try { var r = obj[props[i]] } catch (_) { var r = "N/A" }
		if (r != null && r.constructor.name === "Array")
			result.push(props[i] + " = [" + r + "]");
		else result.push(props[i] + " = " + r);
	}
	// Methods
	result.push('\rMETHODS:\r');
	var props = obj.reflect.methods.sort();
	for (var i = 0; i < props.length; i++) {
		if (props[i].toString() === "==" || props[i].toString() === "===") continue;
		result.push(props[i].name + "()");
	}
	AlertScroll("Properties", result);
}

// Modified from 'Scrollable alert' by Peter Kahrel
// http://forums.adobe.com/message/2869250#2869250
function AlertScroll(title, input) {
	if (input instanceof Array) input = input.join("\r");
	var lines = input.split(/\r|\n/g);
	var w = new Window("dialog", title);
	var list = w.add("edittext", undefined, input, { multiline: true, scrolling: true, readonly: true });
	list.characters = (function() {
		for (var i = 0, width = 50; i < lines.length; i++) width = Math.max(width, lines[i].length);
		return width;
	})();
	list.minimumSize.width = 100; list.maximumSize.width = 1024;
	list.minimumSize.height = 100; list.maximumSize.height = 1024;
	w.add("button", undefined, "Close", { name: "ok" });
	w.show();
}
