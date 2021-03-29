/*
	Show color profiles 1.2
	© March 2021, Paul Chiorean
	Shows all color profiles available to the document.
*/

if (app.documents.length == 0) exit();
var profilesCMYK = app.activeDocument.cmykProfileList;
var profilesRGB = app.activeDocument.rgbProfileList;
var resultArray = [];
resultArray.push('\rCMYK Profiles:\r');
resultArray.push(profilesCMYK.join("\r"));
resultArray.push('\rRGB Profiles:\r');
resultArray.push(profilesRGB.join("\r"));

AlertScroll("Color Profiles", resultArray);


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
	list.minimumSize.height = 100;
	list.maximumSize.height = 880;
	w.add("button", undefined, "Close", { name: "ok" });
	w.show();
}
