var doc = app.activeDocument;

// Delete unused swatches
for (var i = doc.unusedSwatches.length - 1; i >= 0; i--) {
	var name = doc.unusedSwatches[i].name;
	if (name != "") { doc.unusedSwatches[i].remove() };
}
// Normalize similar CMYK swatches
const __ = $.global.localize;
const CM_PROCESS = +ColorModel.PROCESS;
const CS_CMYK = +ColorSpace.CMYK;
var swa, a, r, o, t, k, i;
swa = doc.swatches;
a = doc.colors.everyItem().properties;
r = {};
while (o = a.shift()) { // Gather CMYK swatches => {CMYK_Key => {id, name}[]}
	if (o.model != CM_PROCESS) continue;
	if (o.space != CS_CMYK) continue;
	t = swa.itemByName(o.name);
	if (!t.isValid) continue;
	if (t.name == "Safe area") continue;
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