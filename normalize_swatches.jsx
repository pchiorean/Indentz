/*
	Normalize swatches v1.2.0
	June 2020, Paul Chiorean
	This script converts RGB process colors to CMYK, removes CMYK swatch duplicates 
	and sets every name in "C= M= Y= K=" form, and deletes unused swatches.
	
	NormalizeCMYK written by Marc Autret:
	https://www.indiscripts.com/post/2018/06/indesign-scripting-forum-roundup-12
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;

RGB2CMYK(doc); // Convert RGB process colors to CMYK
NormalizeCMYK(doc); // Normalize similar CMYK swatches
DeleteUnused(doc); // Delete unused swatches


function RGB2CMYK(/*Document*/doc, col, i) {
	col = doc.colors;
	for (i = 0; i < col.length; i++) {
		if (col[i].model == ColorModel.PROCESS && col[i].space == ColorSpace.RGB)
			col[i].space = ColorSpace.CMYK;
	}
}

function NormalizeCMYK(/*Document*/doc, swa, a, r, o, t, k, i) {
	const __ = $.global.localize;
	const CM_PROCESS = +ColorModel.PROCESS;
	const CS_CMYK = +ColorSpace.CMYK;
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
	for (k in r) { // Remove dups and normalize names
		if (!r.hasOwnProperty(k)) continue;
		t = swa.itemByID((o = (a = r[k])[0]).id);
		for (i = a.length; --i; swa.itemByID(a[i].id).remove(t));
		if (k == o.name) continue; // No need to rename
		try { t.name = k } catch (_) {} // Prevent read-only errors
	}
}

function DeleteUnused(/*Document*/doc, swa, i) {
	swa = doc.unusedSwatches;
	for (i = 0; i < swa.length; i++) {
		if (swa[i].name != "") swa[i].remove();
	}
}