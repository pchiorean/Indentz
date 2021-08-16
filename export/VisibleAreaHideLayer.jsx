/*
	Hide visible area v2.1.1 (2021-08-16)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Hides the 'visible area' layer (and variants).

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length == 0) exit();

(function(doc) {
	var layerNames = [
		"safety margins", "safe area", "segmentation",
		"visible area", "rahmen", "sicht*", "*vi?ib*", "vis?*"
	];

	for (var i = 0, n = doc.layers.length; i < n; i++)
		if (IsIn(doc.layers[i].name, layerNames, false)) doc.layers[i].visible = false;

	// Modified from FORWARD.Util functions, by Richard Harrington
	// https://github.com/richardharrington/indesign-scripts
	function IsIn(searchValue, array, caseSensitive) {
		caseSensitive = (typeof caseSensitive !== 'undefined') ? caseSensitive : true;
		var item;
		if (!caseSensitive && typeof searchValue === 'string') searchValue = searchValue.toLowerCase();
		for (var i = 0, n = array.length; i < n; i++) {
			item = array[i];
			if (!caseSensitive && typeof item === 'string') item = item.toLowerCase();
			// if (item === searchValue) return true;
			item = RegExp("^" + item.replace(/\*/g, ".*").replace(/\?/g, ".") + "$", "g");
			if (item.test(searchValue)) return true;
		};
	};
})(app.activeDocument);
