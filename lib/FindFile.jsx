/**
 * Returns the first occurrence of a data file, first searching for a local one (in the current
 * folder or the parent folder), then a global one (on the desktop or next to the script).
 * @param {string} filename - Filename
 * @param {boolean} [skipLocal] - Don't search locally
 * @returns {File} - File object
 */
function FindFile(filename, skipLocal) {
	var file = "";
	var script = function() { try { return app.activeScript } catch(e) { return new File(e.fileName) } }();
	if (!skipLocal) {
		if (doc.saved && (file = File(app.activeDocument.filePath + "/_" + filename)) && file.exists) return file;
		if (doc.saved && (file = File(app.activeDocument.filePath + "/" + filename)) && file.exists) return file;
		if (doc.saved && (file = File(app.activeDocument.filePath + "/../_" + filename)) && file.exists) return file;
		if (doc.saved && (file = File(app.activeDocument.filePath + "/../" + filename)) && file.exists) return file;
	};
	if ((file = File(Folder.desktop + "/" + filename)) && file.exists) return file;
	if ((file = File(script.path + "/" + filename)) && file.exists) return file;
	if ((file = File(script.path + "/../" + filename)) && file.exists) return file;
};
