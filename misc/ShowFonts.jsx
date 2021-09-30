/*
	Show used fonts 1.4.5 (2021-09-30)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Shows all fonts used in the current document.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

// @include '../lib/Report.jsxinc';

if (app.documents.length === 0) exit();

var f = {
	installed: [],
	substituted: [],
	fauxed: [],
	notAvailable: [],
	unknown: []
};
var usedFonts = app.activeDocument.fonts.everyItem().getElements();

for (var i = 0, n = usedFonts.length; i < n; i++) {
	switch (String(usedFonts[i].status)) {
		case 'INSTALLED':     f.installed.push(usedFonts[i].fontFamily    + '\t' + usedFonts[i].fontStyleName); break;
		case 'SUBSTITUTED':   f.substituted.push(usedFonts[i].fontFamily  + '\t' + usedFonts[i].fontStyleName); break;
		case 'FAUXED':        f.fauxed.push(usedFonts[i].fontFamily       + '\t' + usedFonts[i].fontStyleName); break;
		case 'NOT_AVAILABLE': f.notAvailable.push(usedFonts[i].fontFamily + '\t' + usedFonts[i].fontStyleName); break;
		case 'UNKNOWN':       f.unknown.push(usedFonts[i].fontFamily      + '\t' + usedFonts[i].fontStyleName); break;
	}
}

report(
	'INSTALLED:\n\n'     + f.installed.join('\n')    + '\n\n' +
	'SUBSTITUTED:\n\n'   + f.substituted.join('\n')  + '\n\n' +
	'FAUXED:\n\n'        + f.fauxed.join('\n')       + '\n\n' +
	'NOT_AVAILABLE:\n\n' + f.notAvailable.join('\n') + '\n\n' +
	'UNKNOWN:\n\n'       + f.unknown.join('\n'),
	'Document fonts'
);
