/*
	Show properties 2.1.3 (2021-07-08)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Shows properties and methods of the selected object/active document/the application.

	Inspired by:
	https://github.com/grefel/indesignjs/blob/version2/Allgemeine_Skripte/EigenschaftenAnzeigen.jsx
	https://github.com/basiljs/basil.js/blob/master/src/includes/environment.js

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

var obj = app;
if (app.documents.length > 0) obj = app.documents[0];
if (app.documents.length > 0 && app.selection.length > 0) obj = app.selection[0];
if (obj === app) if (!(confirm("Will show properties of the application, proceed?", false))) exit();

var result = [];
Inspect(obj);

result.push("\nMETHODS:");
var methods = obj.reflect.methods.sort();
for (var i = 0; i < methods.length; i++) {
	if (methods[i].toString() === "==" || methods[i].toString() === "===") continue;
	result.push(methods[i].name + "() (Method)");
};
Report(result, obj.reflect.name + " | " + obj.toSource(), true);


function Inspect(obj, prefix, level, maxLevel) {
	level = level || 1;
	maxLevel = maxLevel || 3;
	prefix = prefix || "";
	if (level > maxLevel) return;

	var props = obj.reflect.properties.sort();
	for (var i = 0, val; i < props.length; i++) {
		if (props[i].toString() === "__proto__" ||
			props[i].toString() === "properties" ||
			props[i].toString() === "isValid" ||
			(props[i].toString() === "length" && obj[props[i]] == 0)
		) continue;
		try {
			val = obj[props[i]], str = "";
			if (val != null) switch (val.constructor.name) {
				case "Array": str = "[ " + val + " ] (Array)"; break;
				case "Boolean": str = val + " (Boolean)"; break;
				case "Color": str = "[ " + val.colorValue + " ] '" + val.name + "' (Color)"; break;
				case "Document": str = "'" + val.name + "' (Document)"; break;
				case "Enumerator": str = val + " (" + (val).toString() + ") (Enumerator)"; break;
				case "Font": str = val.name.replace(/\t/g, " ") + " (Font)" ; break;
				case "Layer": str = "'" + val.name + "' (Layer)"; break;
				case "Number": str = val + " (Number)" ; break;
				case "Page": str = val.index + " (Page)"; break;
				case "Spread": str = val.index + " (Spread)"; break;
				case "String": str = "'" + val + "' (String)"; break;
				case "Swatch": str = "'" + val.name + "' (Swatch)"; break;
				default: str = "[" + val.constructor.name + "]";
			};
		} catch (_) { str = "N/A" };
		result.push((level == 1 && result.length > 0 ? "\n" : "") + prefix + props[i] + " = " + str);
		if (val != null && str != "N/A" && val.reflect.properties.length > 1) {
			if (/^parent.*/gi.test(props[i].toString())) continue;
			Inspect(val, prefix + props[i] + ".", level+1, maxLevel);
		};
	};
};

// Inspired by this scrollable alert by Peter Kahrel:
// http://web.archive.org/web/20100807190517/http://forums.adobe.com/message/2869250#2869250
function Report(msg, title, /*bool*/filter, /*bool*/compact) {
	if (msg instanceof Array) msg = msg.join("\n"); msg = msg.split(/\r|\n/g);
	if (compact && msg.length > 1) {
		msg = msg.sort();
		for (var i = 1, l = msg[0]; i < msg.length; l = msg[i], i++)
			if (l == msg[i] || msg[i] == "") { msg.splice(i, 1); i-- };
	};
	var w = new Window('dialog', title);
	if (filter && msg.length > 1) var search = w.add('edittext { characters: 40, \
		helpTip: "Special operators: \'?\' (any character), space and \'*\' (and), \'|\' (or)" }');
	var list = w.add('edittext', undefined, msg.join("\n"), { multiline: true, scrolling: true, readonly: true });
	w.add('button { text: "Close", properties: { name: "ok" } }');
	list.characters = (function() {
		for (var i = 0, width = 50; i < msg.length;
		width = Math.max(width, msg[i].toString().length), i++);
		return width;
	})();
	list.minimumSize.width = 600, list.maximumSize.width = 1024;
	list.minimumSize.height = 100, list.maximumSize.height = 1024;
	w.ok.active = true;
	if (filter && msg.length > 1) {
		search.onChanging = function() {
			if (this.text == "") { list.text = msg.join("\n"); w.text = title; return };
			var str = this.text.replace(/[.\[\]{+}]/g, "\\$&"); // Pass through '^*()|?'
			str = str.replace(/\?/g, "."); // '?' -> any character
			if (/[ *]/g.test(str)) str = "(" + str.replace(/ +|\*/g, ").*(") + ")"; // space or '*' -> AND
			str = RegExp(str, "gi");
			for (var i = 0, result = []; i < msg.length; i++) {
				var line = msg[i].toString().replace(/^\s+?/g, "");
				if (str.test(line)) result.push(line.replace(/\r|\n/g, "\u00b6").replace(/\t/g, "\\t"));
			};
			w.text = str + " | " + result.length + " record" + (result.length == 1 ? "" : "s");
			if (result.length > 0) { list.text = result.join("\n") } else list.text = "";
		};
	};
	w.show();
};
