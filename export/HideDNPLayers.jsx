/*
	Hide DNP layers 23.9.23
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Hides DO-NOT-PRINT layers.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length === 0) exit();

(function (doc) {
	var layerNames = [
		'-*', '.*',
		'covered area*',
		'visible area', 'rahmen', 'sicht*', '*vi?ib*',
		'safe*area', 'safe*margins', 'segmentation',
		'fold', 'falz',
		'guides', 'grid', 'masuratori'
	];

	for (var i = 0, n = doc.layers.length; i < n; i++)
		if (isInArray(doc.layers[i].name, layerNames)) doc.layers[i].visible = false;

	function isInArray(searchValue, array, caseSensitive) {
		caseSensitive = (caseSensitive === undefined) ? false : caseSensitive;
		for (var i = 0, n = array.length; i < n; i++) {
			if (RegExp('^'
				+ array[i]
					.replace(/[|^$(.)[\]{+}\\]/g, '\\$&')     // Escape regex tokens, pass '*' and '?'
					.replace(/\*/g, '.*').replace(/\?/g, '.') // '*' and '?' wildcards
				+ '$', caseSensitive ? '' : 'i'               // Case sensitivity flag
			).test(searchValue)) return true;
		}
		return false;
	}
}(app.activeDocument));
