/*
	List color profiles 1.1.1
	© July 2020, Paul Chiorean
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


// Scrollable alert function by Peter Kahrel
// http://forums.adobe.com/message/2869250#2869250
function AlertScroll(title, input) {
	if (input instanceof Array) input = input.join("\r");
	var w = new Window("dialog", title);
	var list = w.add("edittext", undefined, input, { multiline: true, scrolling: true });
	list.maximumSize.height = app.documents.length > 0 ? app.activeWindow.bounds[2] * .75 : 880;
	list.minimumSize.width = 650;
	w.add("button", undefined, "Close", { name: "ok" });
	w.show();
}