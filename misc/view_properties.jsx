/*
Modified from https://github.com/grefel/indesignjs/blob/version2/Allgemeine_Skripte/
EigenschaftenAnzeigen.jsx by Gregor Fellenz (grefel).
The script shows all properties and methods of a selected object.
*/

var uIL = app.scriptPreferences.userInteractionLevel;
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;

showProps();

app.scriptPreferences.userInteractionLevel = uIL;


function showProps() {
	if (app.documents.length > 0 && app.selection.length > 0) {
		object = app.selection[0];
	} else if (app.documents.length > 0) {
		alert("Nothing is selected.\nThe properties and methods of the document are displayed.")
		object = app.documents[0];
	} else {
		alert("Nothing is selected.\nThe properties and methods of the application are displayed.")
		object = app;
	}

	var resultArray = [];
	for (var i = 0; i < object.reflect.properties.length; i++) {
		var property = object.reflect.properties[i];
		if (property.toString() === "__proto__" || property.toString() === "reflect" || property.toString() === "properties") continue;
		try { result = object[property] } catch (e) { result = "N/A" };
		if (result != null && result.constructor.name === "Array") resultArray.push(object.constructor.name + "." + property + " = [" + result + "]");
		else resultArray.push(object.constructor.name + "." + property + " = " + result);
	}
	alert_scroll("Properties", resultArray.sort());
}

// Scrollable alert function by Peter Kahrel http://forums.adobe.com/message/2869250#2869250
function alert_scroll(title, input) {
	if (input instanceof Array) input = input.join("\r");
	var w = new Window("dialog", title);
	var list = w.add("edittext", undefined, input, { multiline: true, scrolling: true });
	list.maximumSize.height = app.activeWindow.bounds[2] - 200;
	list.minimumSize.width = 650;
	w.add("button", undefined, "Close", { name: "ok" });
	w.show();
}