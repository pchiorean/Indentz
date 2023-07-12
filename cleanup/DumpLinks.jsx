/*
	Dump links 23.7.11
	(c) 2023 Paul Chiorean <jpeg@basement.ro>

	Saves document's links to a TSV file compatible with `ReplaceLinks.jsx`

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

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
dataFile.writeln('Relink to\tDocument links'); // Header

links = doc.links.everyItem().getElements();
linkS = (function () {
	var s = [];
	for (i = 0; i < links.length; i++) s.push(decodeURI(links[i].filePath));
	return s;
}());
linkS = unique(linkS);
while ((l = linkS.shift())) dataFile.writeln('\t' + File(l).fullName);
dataFile.close();

// Get unique array elements
// http://indisnip.wordpress.com/2010/08/24/findchange-missing-font-with-scripting/
function unique(/*array*/array) {
	var i, j;
	var r = [];
	o: for (i = 0; i < array.length; i++) {
		for (j = 0; j < r.length; j++) if (r[j] === array[i]) continue o;
		if (array[i] !== '') r[r.length] = array[i];
	}
	return r;
}
