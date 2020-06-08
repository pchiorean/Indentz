if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var item, items = doc.allPageItems;

while (item = items.shift()) {
	switch (item.label) {
		case "alignL":
		case "alignR":
		case "alignT":
		case "alignB":
		case "alignCh":
		case "alignCv":
		case "alignC":
		case "bleed":
		case "expand":
			item.label = "";
	}
}