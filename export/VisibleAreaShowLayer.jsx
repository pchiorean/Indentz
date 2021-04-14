/*
	Show visible area v2.0 (2021-04-14)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Shows the 'visible area' layer (or equivalents).

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length == 0) exit();

var layerName = [
	"safe area",
	"visible area",
	"visible", "Visible",
	"vizibil", "Vizibil",
	"vis. area", "Vis. area"
];

(function(doc) {
	for (var i = 0; i < layerName.length; i++) {
		var layer = doc.layers.item(layerName[i]);
		if (layer.isValid) layer.visible = true;
	}
})(app.activeDocument);
