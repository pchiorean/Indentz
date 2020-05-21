var doc = app.activeDocument;
var items = doc.allPageItems;

try { doc.swatches.itemByName("Safe area").colorValue = [100, 0, 0, 0] } catch (_) {};

for (i = 0; i < items.length; i++) items[i].redefineScaling();

doc.layers.itemByName("id").visible = false;
doc.layers.itemByName("ratio").visible = false;
doc.layers.itemByName("ratio").locked = true;
doc.layers.itemByName("safe area").visible = true;
doc.layers.itemByName("HW").visible = false;
