/*
	Show properties 1.5 (2021-05-16)
	Paul Chiorean (jpeg@basement.ro)

	Shows properties and methods of a selected object/the document/the application.

	Modified from https://github.com/grefel/indesignjs/blob/version2/Allgemeine_Skripte/
	EigenschaftenAnzeigen.jsx by Gregor Fellenz (grefel).
*/

var obj = app;
if (app.documents.length > 0) obj = app.documents[0];
if (app.documents.length > 0 && app.selection.length > 0) obj = app.selection[0];
if (obj === app) if (!(confirm("Will show properties of the application, proceed?", false))) exit();

var result = [];
result.push(obj.reflect.name);
result.push(obj.toSource());

result.push('\nPROPERTIES:');
var props = obj.reflect.properties.sort();
for (var i = 0, r; i < props.length; i++) {
	if (props[i].toString() === "__proto__" || props[i].toString() === "properties") continue;
	try { r = obj[props[i]] } catch (_) { r = "N/A" };
	if (r != null && r.constructor.name === "Array") r = "[ " + r + " ]";
	result.push("\n" + props[i] + " = " + r);
	// Go down one more level
	if (r != null && r != "N/A" && r.reflect.properties.length > 1) {
		var props2 = r.reflect.properties.sort();
		for (var j = 0, q; j < props2.length; j++) {
			if (props2[j].toString() === "__proto__" || props2[j].toString() === "properties") continue;
			try { q = r[props2[j]] } catch (_) { q = "N/A" };
			if (q != null && q.constructor.name === "Array") q = "[ " + q + " ]";
			result.push(props[i] + "." + props2[j] + " = " + q);
		};
	};
	// result.push('\n');
};
result.push('\nMETHODS:\n');
var props = obj.reflect.methods.sort();
for (var i = 0; i < props.length; i++) {
	if (props[i].toString() === "==" || props[i].toString() === "===") continue;
	result.push(props[i].name + "()");
};
AlertScroll("Properties", result, true);

// Modified from 'Scrollable alert' by Peter Kahrel
// http://forums.adobe.com/message/2869250#2869250
function AlertScroll(title, msg, /*bool*/filter) {
	if (msg instanceof Array) msg = msg.join("\n");
	var msgArray = msg.split(/\r|\n/g);
	var w = new Window("dialog", title);
	if (filter) var search = w.add("edittext { characters: 40 }");
	var list = w.add("edittext", undefined, msg, { multiline: true, scrolling: true, readonly: true });
	list.characters = (function() {
		for (var i = 0, width = 50; i < msgArray.length; i++) width = Math.max(width, msgArray[i].length);
		return width;
	})();
	list.minimumSize.width = 100; list.maximumSize.width = 1024;
	list.minimumSize.height = 100; list.maximumSize.height = 1024;
	w.add("button", undefined, "Close", { name: "ok" });
	w.ok.active = true;
	if (filter) search.onChanging = function() {
		var result = [];
		for (var i = 0; i < msgArray.length; i++)
			if (msgArray[i].toLowerCase().indexOf(this.text) != -1) result.push(msgArray[i]);
		if (result.length > 0) list.text = result.join("\n")
		else list.text = "Nothing found."
	};
	w.show();
};
