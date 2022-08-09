/*
	Show used fonts 21.10.17
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Shows all fonts used in the current document.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

// @includepath '.;./lib;../lib';
// @include 'report.jsxinc';

if (app.documents.length === 0) exit();

var messages = '';
var f = {
	installed: [],
	substituted: [],
	fauxed: [],
	unavailable: [],
	unknown: []
};
var usedFonts = app.activeDocument.fonts.everyItem().getElements();

for (var i = 0, n = usedFonts.length; i < n; i++) {
	switch (String(usedFonts[i].status)) {
		case 'INSTALLED':     f.installed.push(usedFonts[i].fontFamily    + '\t' + usedFonts[i].fontStyleName); break;
		case 'SUBSTITUTED':   f.substituted.push(usedFonts[i].fontFamily  + '\t' + usedFonts[i].fontStyleName); break;
		case 'FAUXED':        f.fauxed.push(usedFonts[i].fontFamily       + '\t' + usedFonts[i].fontStyleName); break;
		case 'NOT_AVAILABLE': f.unavailable.push(usedFonts[i].name); break;
		case 'UNKNOWN':       f.unknown.push(usedFonts[i].name); break;
	}
}

if (f.installed.length   > 0) messages +=     'FontStatus.INSTALLED:\n'     + f.installed.sort().join('\n');
if (f.substituted.length > 0) messages += '\n\nFontStatus.SUBSTITUTED:\n'   + f.substituted.sort().join('\n');
if (f.fauxed.length      > 0) messages += '\n\nFontStatus.FAUXED:\n'        + f.fauxed.sort().join('\n');
if (f.unavailable.length > 0) messages += '\n\nFontStatus.NOT_AVAILABLE:\n' + f.unavailable.sort().join('\n');
if (f.unknown.length     > 0) messages += '\n\nFontStatus.UNKNOWN:\n'       + f.unknown.sort().join('\n');

if (messages.length > 0) report(messages, 'Document fonts'); else alert('0 fonts in document.');
