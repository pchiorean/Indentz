// Hide the layer "safe area"
try {
    app.activeDocument.layers.item("safe area").visible = false;
} catch (e) {}
