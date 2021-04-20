/*
	Show color profiles 1.2.2 (2021-04-20)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Shows all color profiles available to the document.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length == 0) exit();
var profilesCMYK = app.activeDocument.cmykProfileList;
var profilesRGB = app.activeDocument.rgbProfileList;
var result = [];
result.push('\rCMYK Profiles:\r');
result.push(profilesCMYK.join("\r"));
result.push('\rRGB Profiles:\r');
result.push(profilesRGB.join("\r"));

AlertScroll("Color Profiles", result);


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
	w.ok.active = true;
	w.show();
}
