/*
    Delete gremlins v1.3.8
    © April 2020, Paul Chiorean
    This script does some househeeping.
*/

var doc = app.activeDocument;

// Initialization
doc.zeroPoint = [0, 0];
doc.guidePreferences.guidesShown = true;
doc.guidePreferences.guidesLocked = false;
doc.viewPreferences.showFrameEdges = true;
app.generalPreferences.ungroupRemembersLayers = true;
app.clipboardPreferences.pasteRemembersLayers = true;
app.activeWindow.transformReferencePoint = AnchorPoint.CENTER_ANCHOR;
doc.pageItemDefaults.fillColor = "None";
doc.pageItemDefaults.strokeColor = "None";
doc.selection = [];

// Delete unused swatches
for (var i = doc.unusedSwatches.length - 1; i >= 0; i--) {
    var name = doc.unusedSwatches[i].name;
    if (name != "") { doc.unusedSwatches[i].remove() };
}

// Normalize similar CMYK swatches
function normalizeCMYK( /*Document*/ doc, swa, a, r, o, t, k, i) {
    const __ = $.global.localize;
    const CM_PROCESS = +ColorModel.PROCESS;
    const CS_CMYK = +ColorSpace.CMYK;
    swa = doc.swatches;
    a = doc.colors.everyItem().properties;
    r = {};
    // Gather CMYK swatches => {CMYK_Key => {id, name}[]}
    while (o = a.shift()) {
        if (o.model != CM_PROCESS) continue;
        if (o.space != CS_CMYK) continue;
        t = swa.itemByName(o.name);
        if (!t.isValid) continue;
        for (i = (k = o.colorValue).length; i--; k[i] = Math.round(k[i]));
        k = __("C=%1 M=%2 Y=%3 K=%4", k[0], k[1], k[2], k[3]);
        (r[k] || (r[k] = [])).push({ id: t.id, name: t.name });
    }
    for (k in r) {
        if (!r.hasOwnProperty(k)) continue;
        t = swa.itemByID((o = (a = r[k])[0]).id);
        for (i = a.length; --i; swa.itemByID(a[i].id).remove(t));
        if (k == o.name) continue; // No need to rename
        try { t.name = k } catch (_) {} // Prevent read-only errors
    }
}
normalizeCMYK(app.properties.activeDocument);

// Delete empty spreads
for (var i = 0; i < doc.spreads.length; i++) {
    if (doc.spreads[i].pageItems.length == 0 && doc.spreads.length > 1) {
        doc.spreads[i].remove();
    }
}

try { app.menuActions.item("$ID/Delete Unused Layers").invoke() } catch (e) {}; // Delete unused layers
try { doc.layers.item("guides" | "Guides").visible = true } catch (e) {}; // Show 'Guides' layer
// try { doc.guides.everyItem().remove() } catch (e) {}; // Delete all guides