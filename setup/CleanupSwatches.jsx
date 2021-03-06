/*
	Cleanup swatches v1.4.1 (2021-05-26)
	Paul Chiorean (jpeg@basement.ro)

	Converts RGB swatches to CMYK, renames them to C= M= Y= K=, deletes unused.
*/

if (!(doc = app.activeDocument)) exit();

// app.doScript(RGB2CMYK, ScriptLanguage.javascript, doc,
// 	UndoModes.ENTIRE_SCRIPT, "Convert RGB process colors to CMYK");
// app.doScript(NormalizeCMYK, ScriptLanguage.javascript, doc,
// 	UndoModes.ENTIRE_SCRIPT, "Normalize similar CMYK swatches");
// app.doScript(DeleteUnused, ScriptLanguage.javascript, doc,
// 	UndoModes.ENTIRE_SCRIPT, "Delete unused swatches");
RGB2CMYK(doc);
NormalizeCMYK(doc);
DeleteUnused(doc);

// Modified from ConvertRGBtoCMYK.jsx by Dave Saunders
// https://community.adobe.com/t5/indesign/rgb-to-cmyk-script/m-p/10050289
function RGB2CMYK(doc, c, i, j, k) {
	for (i = 0; i < doc.colors.length; i++) {
		c = doc.colors[i];
		if (c.model == ColorModel.PROCESS && c.space == ColorSpace.RGB) {
			c.space = ColorSpace.CMYK;
			// Round CMYK values
			for (j = (k = c.colorValue).length; j--;
			k[j] = Math.round(k[j]));
			c.colorValue = k;
		}
	}
}

// NormalizeCMYK by Marc Autret
// https://www.indiscripts.com/post/2018/06/indesign-scripting-forum-roundup-12
function NormalizeCMYK(doc, swa, a, r, o, t, k, i) {
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
		if (t.name == "Safe area" || t.name == "Visible area") continue;
		for (i = (k = o.colorValue).length; i--; k[i] = Math.round(k[i]));
		k = __("C=%1 M=%2 Y=%3 K=%4", k[0], k[1], k[2], k[3]);
		(r[k] || (r[k] = [])).push({ id: t.id, name: t.name });
	}
	for (k in r) { // Remove dups and normalize names
		if (!r.hasOwnProperty(k)) continue;
		t = swa.itemByID((o = (a = r[k])[0]).id);
		try { for (i = a.length; --i; swa.itemByID(a[i].id).remove(t)); } catch (_) {};
		if (k == o.name) continue; // No need to rename
		try { t.name = k } catch (_) {} // Prevent read-only errors
	}
}

function DeleteUnused(doc, swa, i) {
	swa = doc.unusedSwatches;
	for (i = 0; i < swa.length; i++) if (swa[i].name != "") swa[i].remove();
}