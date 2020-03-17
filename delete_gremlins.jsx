/*
    Delete gremlins v1.3.1
    © March 2020, Paul Chiorean
    This script does some househeeping.
*/

var doc = app.activeDocument

// Initialization
doc.zeroPoint = [0, 0]
doc.cmykProfile = "ISO Coated v2 (ECI)"
doc.rgbProfile = "sRGB IEC61966-2.1"
doc.guidePreferences.guidesShown = true;
doc.guidePreferences.guidesLocked = false;
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.showFrameEdges = true;
doc.viewPreferences.cursorKeyIncrement = "0.2mm";
doc.textPreferences.leadingKeyIncrement = "0.5pt";
doc.textPreferences.kerningKeyIncrement = 5;
doc.textPreferences.baselineShiftKeyIncrement = "0.1pt";
doc.pasteboardPreferences.pasteboardMargins = ["150mm", "25mm"];
doc.documentPreferences.intent = DocumentIntentOptions.PRINT_INTENT;
doc.transparencyPreferences.blendingSpace = BlendingSpace.CMYK;
app.transformPreferences.adjustStrokeWeightWhenScaling = true;
app.transformPreferences.adjustEffectsWhenScaling = true;
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;
app.activeWindow.transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
doc.pageItemDefaults.fillColor = "None";
doc.pageItemDefaults.strokeColor = "None";
doc.selection = []
doc.selectionKeyObject = null

// Delete unused swatches
for (var i = doc.unusedSwatches.length - 1; i >= 0; i--) {
    var name = doc.unusedSwatches[i].name;
    if (name != "") {
        doc.unusedSwatches[i].remove();
    }
}

// Normalize similar CMYK swatches
function normalizeCMYK( /*Document*/ doc, swa, a, r, o, t, k, i) {
    const __ = $.global.localize;
    const CM_PROCESS = +ColorModel.PROCESS;
    const CS_CMYK = +ColorSpace.CMYK;
    swa = doc.swatches;
    a = doc.colors.everyItem().properties;
    r = {};
    // gather CMYK swatches => {CMYK_Key => {id, name}[]}
    while (o = a.shift()) {
        if (o.model != CM_PROCESS) continue;
        if (o.space != CS_CMYK) continue;
        t = swa.itemByName(o.name);
        if (!t.isValid) continue;
        for (i = (k = o.colorValue).length; i--; k[i] = Math.round(k[i]));
        k = __("C=%1 M=%2 Y=%3 K=%4", k[0], k[1], k[2], k[3]);
        (r[k] || (r[k] = [])).push({
            id: t.id,
            name: t.name
        });
    }
    for (k in r) {
        if (!r.hasOwnProperty(k)) continue;
        t = swa.itemByID((o = (a = r[k])[0]).id);
        for (i = a.length; --i; swa.itemByID(a[i].id).remove(t));
        if (k == o.name) continue; // no need to rename
        try {
            t.name = k
        } catch (_) {} // prevent read-only errors
    }
};
normalizeCMYK(app.properties.activeDocument);

// Delete empty spreads
for (var i = 0; i < doc.spreads.length; i++) {
    if (doc.spreads[i].pageItems.length == 0) {
        doc.spreads[i].remove();
    }
}

// Delete unused layers
try {
    app.menuActions.item("$ID/Delete Unused Layers").invoke();
} catch (e) {}

// Show 'Guides' layer
try {
    doc.layers.item("guides" | "Guides").visible = true;
} catch (e) {}

// Delete all guides
if (doc.guides.length > 0) {
    doc.guides.everyItem().remove();
}