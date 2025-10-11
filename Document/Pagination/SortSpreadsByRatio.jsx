/*
	Sort spreads by ratio 25.10.11
	(c) 2025 Paul Chiorean <jpeg@basement.ro>

	Sorts document spreads by ratio.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, 'Sort spreads by ratio');

function main() {
	sortSpreadsByRatio();

	function sortSpreadsByRatio() {
		var i, n;
		ratios = [];

		for (i = 0, n = doc.spreads.length; i < n; i++) {
			ratios.push(Number(
				(doc.spreads[i].pages.lastItem().bounds[3] - doc.spreads[i].pages.firstItem().bounds[1])
				/ (doc.spreads[i].pages.lastItem().bounds[2] - doc.spreads[i].pages.firstItem().bounds[0]))
			);
		}

		for (i = 0, n = ratios.length - 1; i < n; i++) {
			if (ratios[i] > ratios[(i + 1)]) {
				doc.spreads[i].move(LocationOptions.AFTER, doc.spreads[i + 1]);
				sortSpreadsByRatio();
			}
		}
	}
}
