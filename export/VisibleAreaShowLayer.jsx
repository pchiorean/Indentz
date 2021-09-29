/*
	Hide visible area v2.1.3 (2021-09-29)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Shows the 'visible area' layer (and variants).

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length === 0) exit();

(function (doc) {
	var layerNames = [
		'visible area', '*vi?ib*', 'vis?*',
		'safety margins', 'safe area', 'segmentation',
		'rahmen', 'sicht*'
	];

	for (var i = 0, n = doc.layers.length; i < n; i++)
		if (isIn(doc.layers[i].name, layerNames)) doc.layers[i].visible = true;

	/**
	* Matches a string against elements of an array, using wildcards and case sensitivity.
	* @param {String} searchValue - String to be matched
	* @param {Array} array - An array of strings; wildcards: '*' (zero or more characters), '?' (exactly one character)
	* @param {Boolean} [caseSensitive=false] - Case sensitivity; default false
	* @returns {Boolean} - True for match, false for no match
	*/
	function isIn(searchValue, array, caseSensitive) {
		caseSensitive = (caseSensitive === undefined) ? false : caseSensitive;
		for (var i = 0, n = array.length; i < n; i++) {
			if (RegExp('^' + array[i]
				.replace(/[|^$(.)[\]{+}\\]/g, '\\$&')       // Escape regex tokens, pass '*' and '?'
				.replace(/\*/g, '.*').replace(/\?/g, '.') + // '*' and '?' wildcards
				'$', caseSensitive ? '' : 'i'               // Case sensitivity flag
			).test(searchValue)) return true;
		}
		return false;
	}
}(app.activeDocument));
