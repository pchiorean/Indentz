/*
	Page size from margins v1.3.1 (2020-11-22)
	(c) 2020 Paul Chiorean (jpeg@basement.ro)

	Sets the page size to the page margins.

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

app.doScript(main, ScriptLanguage.javascript, undefined,
	UndoModes.ENTIRE_SCRIPT, "Page size from margins");


function main() {
	app.generalPreferences.objectsMoveWithPage = false;
	doc.adjustLayoutPreferences.enableAdjustLayout = false;
	doc.adjustLayoutPreferences.enableAutoAdjustMargins = false;
	for (var i = 0; i < doc.pages.length; i++) {
		var page = doc.pages[i];
		var mgPg = page.marginPreferences;
		if (mgPg.top + mgPg.left + mgPg.bottom + mgPg.right == 0) continue;
		var mg = page.rectangles.add({ // Make temp rectangle
			contentType: ContentType.UNASSIGNED,
			fillColor: "None", strokeColor: "None",
			geometricBounds: [
				page.bounds[0] + mgPg.top,
				page.bounds[1] + (page.side == PageSideOptions.LEFT_HAND ? mgPg.right : mgPg.left),
				page.bounds[2] - mgPg.bottom,
				page.bounds[3] - (page.side == PageSideOptions.LEFT_HAND ? mgPg.left : mgPg.right)
			]});
		page.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }
		doc.marginPreferences.properties = { top: 0, left: 0, bottom: 0, right: 0 }
		page.layoutRule = LayoutRuleOptions.OFF;
		page.reframe(CoordinateSpaces.SPREAD_COORDINATES, [
			mg.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0],
			mg.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES)[0]
		]);
		mg.remove();
	}
	// Also set document size
	if (doc.pages.length == 1) {
		var sizePg = {
			width: (page.bounds[3] - page.bounds[1]),
			height: (page.bounds[2] - page.bounds[0]) }
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
}
