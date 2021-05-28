/*
	Show color profiles 1.3.1 (2021-05-28)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Shows all color profiles available to the document.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length == 0) exit();
var profilesCMYK = app.activeDocument.cmykProfileList;
var profilesRGB = app.activeDocument.rgbProfileList;
var result = [];
result.push('CMYK Profiles:\n');
result.push(profilesCMYK.join("\n"));
result.push('\nRGB Profiles:\n');
result.push(profilesRGB.join("\n"));

AlertScroll("Color Profiles", result, true);


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
			if (msgArray[i].toLowerCase().indexOf((this.text).toLowerCase()) != -1) result.push(msgArray[i]);
		if (result.length > 0) list.text = result.join("\n")
		else list.text = "Nothing found."
	};
	w.show();
};
