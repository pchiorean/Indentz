var doc = app.activeDocument;
var item, items = doc.allPageItems;

while (item = items.shift()) item.label = "";