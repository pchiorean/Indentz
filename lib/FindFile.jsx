/**
 * Finds the first occurence of a file, looking in the current folder, on the desktop, or next to the script.
 * @param {string} fn - Filename
 * @returns {File} - File object
 */
function FindFile(fn) {
	var file = "";
	var script = (function() { try { return app.activeScript } catch(e) { return new File(e.fileName) } })();
	if (doc.saved && (file = File(app.activeDocument.filePath + "/_" + fn)) && file.exists) return file;
	if (doc.saved && (file = File(app.activeDocument.filePath + "/" + fn)) && file.exists) return file;
	if ((file = File(Folder.desktop + "/" + fn)) && file.exists) return file;
	if ((file = File(script.path + "/" + fn)) && file.exists) return file;
	if ((file = File(script.path + "/../" + fn)) && file.exists) return file;
};
