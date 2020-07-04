/*
	Show properties 1.2.0
	July 2020, Paul Chiorean
	The script shows all properties and methods of a selected object.

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
	var resultArray = [];
	for (var i = 0; i < obj.reflect.properties.length; i++) {
		var property = obj.reflect.properties[i];
		if (property.toString() === "__proto__" || property.toString() === "reflect" || property.toString() === "properties") continue;
		try { result = obj[property] } catch (e) { result = "N/A" };
		if (result != null && result.constructor.name === "Array") resultArray.push(obj.constructor.name + "." + property + " = [" + result + "]");
		else resultArray.push(obj.constructor.name + "." + property + " = " + result);
	}
	AlertScroll("Properties", resultArray.sort());
}

// Scrollable alert function by Peter Kahrel
// http://forums.adobe.com/message/2869250#2869250
function AlertScroll(title, input) {
	if (input instanceof Array) input = input.join("\r");
	var w = new Window("dialog", title);
	var list = w.add("edittext", undefined, input, { multiline: true, scrolling: true });
	// list.maximumSize.height = app.activeWindow.bounds[2] - 200;
	list.maximumSize.height = app.documents.length > 0 ? app.activeWindow.bounds[2] - 200 : 900;
	list.minimumSize.width = 650;
	w.add("button", undefined, "Close", { name: "ok" });
	w.show();
}