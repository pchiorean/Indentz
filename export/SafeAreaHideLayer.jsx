/*
	Hide safe area layer v1.2 (2021-04-08)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Hides the 'safe area' layer (or equivalents).

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (app.documents.length == 0) exit();

var saLayerName = [ "safe area", "visible", "Visible",
	"vizibil", "Vizibil", "vis. area", "Vis. area" ];

(function(doc) {
	for (var i = 0; i < saLayerName.length; i++) {
		var saLayer = doc.layers.item(saLayerName[i]);
		if (!saLayer.isValid) continue;
		doc.layers.item(saLayer.name).visible = false;
	}
})(app.activeDocument);
