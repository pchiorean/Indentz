/*
	Fit frame to text, center v1.4.1
	© July 2020, Paul Chiorean
	This script auto-sizes the text frame to the content, center aligned.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
if (doc.selection.length == 0) exit();
var sel = doc.selection;

if (sel[0].hasOwnProperty("parentTextFrames")) var sel = sel[0].parentTextFrames;
for (var i = 0; i < sel.length; i++) {
	var obj = sel[i]; if (obj.constructor.name == "TextFrame") FitFrame2Text(obj);
}


function FitFrame2Text(sel) {
	var centerBefore = sel.resolve(AnchorPoint.CENTER_ANCHOR,
		CoordinateSpaces.SPREAD_COORDINATES);
	var set_VJ = sel.textFramePreferences.verticalJustification;
	sel.fit(FitOptions.FRAME_TO_CONTENT);
	sel.textFramePreferences.properties = {
		autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_CENTER_POINT,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		useNoLineBreaksForAutoSizing: true
	}
	var set_AST = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
	if (sel.lines.length > 1) {
		set_AST = sel.textFramePreferences.autoSizingType ==
		AutoSizingTypeEnum.OFF ?
		AutoSizingTypeEnum.HEIGHT_ONLY :
		AutoSizingTypeEnum.HEIGHT_AND_WIDTH
	};
	sel.textFramePreferences.properties = {
		autoSizingType: set_AST,
		autoSizingReferencePoint: AutoSizingReferenceEnum.CENTER_POINT,
		verticalJustification: VerticalJustification.CENTER_ALIGN
	}
	sel.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
	var centerAfter = sel.resolve(AnchorPoint.LEFT_CENTER_ANCHOR,
		CoordinateSpaces.SPREAD_COORDINATES);
	if (set_VJ == VerticalJustification.CENTER_ALIGN)
		sel.move(undefined, [0, centerBefore[0][1] - centerAfter[0][1]]);
	if (set_VJ == VerticalJustification.BOTTOM_ALIGN)
		sel.move(undefined, [0, (centerBefore[0][1] - centerAfter[0][1]) * 2 ]);
}