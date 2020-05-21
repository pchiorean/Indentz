var doc = app.activeDocument;
var selObj = doc.selection;

prop(selObj[0]);


function prop(obj) {
	$.writeln(obj.reflect.name);
	$.writeln(obj.toSource());
	var props = obj.reflect.properties;
	var array = [];
	$.writeln('\rProperties:');
	for (var i = 0; i < props.length; i++) {
		try {
			array.push(" " + props[i].name + ': ' + obj[props[i].name]);
		} catch (_) {}
		array.sort();
	}
	$.writeln(array.join('\r'));
	var props = obj.reflect.methods.sort();
	$.writeln('\rMethods:');
	for (var i = 0; i < props.length; i++) {
		$.writeln(" " + props[i].name);
	}
}