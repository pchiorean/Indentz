/*
	Show color profiles 21.5.30
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Shows all color profiles available to a document.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

// @include '../lib/report.jsxinc';

tmpDoc = app.documents.add(false);

var profileList = [];
var profilesCMYK = tmpDoc.cmykProfileList;
var profilesRGB = tmpDoc.rgbProfileList;

profileList.push('CMYK Profiles:\n\n' + profilesCMYK.join('\n'));
profileList.push('\nRGB Profiles:\n\n' + profilesRGB.join('\n'));
report(profileList.join('\n'), 'Color Profiles', true);

tmpDoc.close(SaveOptions.NO);
