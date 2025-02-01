/*
	Cleanup swatches 24.11.20
	Paul Chiorean <jpeg@basement.ro>

	Converts RGB swatches to CMYK, renames them to 'C= M= Y= K=' format, deletes unused.
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Cleanup swatches');

function main() {
	// Add unnamed colors
	if ((menu = app.menuActions.itemByID(16403)).enabled) menu.invoke(); // 'Add All Unnamed Colors'

	convertRGB2CMYK(); // Convert RGB process colors to CMYK
	normalizeCMYK(); // Normalize similar CMYK swatches

	// Delete unused and odd swatches
	var c;
	var swa = doc.unusedSwatches;
	while ((c = swa.shift())) if (c.name !== '') c.remove();

	try { doc.colors.itemByName('R=0 G=0 B=0').remove('Black'); } catch (e) {}
	try { doc.colors.itemByName('C=0 M=0 Y=0 K=100').remove('Black'); } catch (e) {}
	try { doc.colors.itemByName('C=0 M=0 Y=0 K=0').remove('Paper'); } catch (e) {}
	try { doc.colors.itemByName('BLANCO').remove('Paper'); } catch (e) {}
}

// Adapted from ConvertRGBtoCMYK.jsx by Dave Saunders and others
// https://community.adobe.com/t5/indesign/rgb-to-cmyk-script/m-p/10050289
function convertRGB2CMYK() {
	var c, i, j, k;

	for (i = 0, n = doc.colors.length; i < n; i++) {
		c = doc.colors[i];

		if (c.model === ColorModel.PROCESS && c.space === ColorSpace.RGB) {
			c.space = ColorSpace.CMYK;

			// Round CMYK values
			for (j = (k = c.colorValue).length; j--; k[j] = Math.round(k[j]));
			c.colorValue = k;
		}
	}
}

// NormalizeCMYK by Marc Autret
// https://www.indiscripts.com/post/2018/06/indesign-scripting-forum-roundup-12
function normalizeCMYK() {
	var o, t, k, i;
	var __ = $.global.localize;
	var CM_PROCESS = +ColorModel.PROCESS;
	var CS_CMYK = +ColorSpace.CMYK;
	var swa = doc.swatches;
	var a = doc.colors.everyItem().properties;
	var r = {};

	while ((o = a.shift())) { // Gather CMYK swatches => {CMYK_Key => {id, name}[]}
		if (o.model !== CM_PROCESS) continue;
		if (o.space !== CS_CMYK) continue;
		t = swa.itemByName(o.name);
		if (!t.isValid) continue;
		if (t.name === 'Safe area' || t.name === 'Visible area') continue;

		for (i = (k = o.colorValue).length; i--; k[i] = Math.round(k[i]));
		k = __('C=%1 M=%2 Y=%3 K=%4', k[0], k[1], k[2], k[3]);
		(r[k] || (r[k] = [])).push({ id: t.id, name: t.name });
	}

	// Remove dups and normalize names
	for (k in r) {
		if (!Object.prototype.hasOwnProperty.call(r, k)) continue;
		t = swa.itemByID((o = (a = r[k])[0]).id);
		try { for (i = a.length; --i; swa.itemByID(a[i].id).remove(t)); } catch (e) {}

		if (k === o.name) continue; // No need to rename
		try { t.name = k; } catch (e) {} // Prevent read-only errors
	}
}
