/*
	Page size from selection v1.8 (2021-06-04)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Sets the page size to the selected objects bounds.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

if (!(doc = app.activeDocument)) exit();
var sel = doc.selection;
if (sel.length == 0 || (sel[0].constructor.name == "Guide")) {
	alert("Select an object and try again."); exit();
}

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Page size from selection");


function main() {
	app.generalPreferences.objectsMoveWithPage = false;
	doc.adjustLayoutPreferences.enableAdjustLayout = false;
	doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
	// Get selection's parent page
	var selObj = sel; var s = selObj[0].parent;
	while (s.constructor.name != "Spread") s = s.parent; var page = s.pages[0];
	for (var i = 0; i < selObj.length; i++) {
		if (selObj[i].parentPage != null) { page = selObj[i].parentPage; break }
	}
	// Get selection dimensions
	var size = selObj[0].geometricBounds;
	for (var i = 1; i < selObj.length; i++) {
		size[0] = Math.min(selObj[i].geometricBounds[0], size[0]);
		size[1] = Math.min(selObj[i].geometricBounds[1], size[1]);
		size[2] = Math.max(selObj[i].geometricBounds[2], size[2]);
		size[3] = Math.max(selObj[i].geometricBounds[3], size[3]);
	}
	var mg = page.rectangles.add({ // Make temp rectangle
		contentType: ContentType.UNASSIGNED,
		fillColor: "None", strokeColor: "None",
		geometricBounds: size });
	page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }
	doc.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }
	page.layoutRule = LayoutRuleOptions.OFF;
	page.reframe(CoordinateSpaces.SPREAD_COORDINATES, [
		mg.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0],
		mg.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0]
	]);
	mg.remove();
	// Also set document size
	var sizePg = { width: size[3] - size[1], height: size[2] - size[0] }
	if (doc.pages.length == 1) {
		try {
			doc.documentPreferences.pageWidth = sizePg.width;
			doc.documentPreferences.pageHeight = sizePg.height;
		} catch (_) {
			while (s = doc.masterSpreads.shift()) {
				while (i = s.pages.shift())
					i.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }
			}
			doc.documentPreferences.pageWidth = sizePg.width;
			doc.documentPreferences.pageHeight = sizePg.height;
		}
	}
	try { app.select(sel) } catch (_) {} // Restore initial selection
}