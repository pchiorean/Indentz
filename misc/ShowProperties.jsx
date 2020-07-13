/*
	Show properties 1.2.1
	© July 2020, Paul Chiorean
	Shows all properties and methods of a selected object.
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
	// Object
	resultArray.push('\rObject:\r');
	resultArray.push(obj.reflect.name);
	resultArray.push(obj.toSource());
	// Properties
	resultArray.push('\rProperties:\r');
	var props = obj.reflect.properties.sort();
	for (var i = 0; i < props.length; i++) {
		if (props[i].toString() === "__proto__" || props[i].toString() === "reflect" || props[i].toString() === "properties") continue;
		try { var result = obj[props[i]] } catch (_) { var result = "N/A" };
		if (result != null && result.constructor.name === "Array") resultArray.push(props[i] + " = [" + result + "]");
		else resultArray.push(props[i] + " = " + result);
	}
	// Methods
	resultArray.push('\rMethods:\r');
	var props = obj.reflect.methods.sort();
	for (var i = 0; i < props.length; i++) {
		if (props[i].toString() === "==" || props[i].toString() === "===") continue;
		resultArray.push(props[i].name + "()");
	}
	AlertScroll("Properties", resultArray);
}

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