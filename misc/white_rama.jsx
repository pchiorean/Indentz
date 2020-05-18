var targetLayer = "RAMA";
var targetFrame = app.activeDocument.layers.item(targetLayer).rectangles;

for (i = 0; i < targetFrame.length; i++) {
    targetFrame[i].properties = {
        strokeColor: "Paper",
        strokeWeight: "5pt",
        strokeAlignment: StrokeAlignment.INSIDE_ALIGNMENT
    }
}