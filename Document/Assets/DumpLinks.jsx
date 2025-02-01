/*
	Dump links 23.10.21
	(c) 2023 Paul Chiorean <jpeg@basement.ro>

	Saves document's links to a TSV file compatible with `ReplaceLinks.jsx`:

	Relink to                  | Links
	/absolute/path/to/img1.psd
	/absolute/path/to/img2.psd
	...

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

// @includepath '.;./lib;../lib;../../lib';
// @include 'unique.jsxinc';

if (!(doc = app.activeDocument)) exit();

var dataFile, l, links, linkS;
var docHasPath = (function () {
	var ret = false;
	try { ret = !!doc.filePath; } catch (e) {}
	return ret;
}());

if (!docHasPath) {
	alert('Can\'t get document path.\nSave the document first and try again.');
	exit();
}

dataFile = File(String(doc.filePath + '/' + doc.name).replace(/\.indd$/ig, '_links.tsv'));
dataFile.open('w');
dataFile.encoding = 'UTF-8';
dataFile.lineFeed = 'Unix';
dataFile.writeln('Relink to\tLinks'); // Header

links = doc.links.everyItem().getElements();
linkS = (function () {
	var s = [];
	for (i = 0; i < links.length; i++) s.push(decodeURI(links[i].filePath));
	return s;
}());
linkS = unique(linkS);
while ((l = linkS.shift())) dataFile.writeln(File(l).fullName);
dataFile.close();
