/*
	Fit frame to text, left v1.5.0
	© July 2020, Paul Chiorean
	Auto-sizes the text frame to the content, left aligned.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
if (doc.selection.length == 0) { exit() } else { var sel = doc.selection };

if (sel[0].hasOwnProperty("parentTextFrames")) var sel = sel[0].parentTextFrames;
for (var i = 0; i < sel.length; i++) {
	var obj = sel[i]; if (obj.constructor.name == "TextFrame") FitFrame2Text(obj, "left");
}

function FitFrame2Text(sel, align) {
	switch (align) {
		case "center":
			var set_AS = AutoSizingReferenceEnum.CENTER_POINT;
			var set_VJ = VerticalJustification.CENTER_ALIGN;
			var set_PJ = Justification.CENTER_ALIGN;
			break;
		case "left":
			var set_AS = AutoSizingReferenceEnum.TOP_LEFT_POINT;
			var set_VJ = VerticalJustification.TOP_ALIGN;
			var set_PJ = Justification.LEFT_ALIGN;
			break;
		case "right":
			var set_AS = AutoSizingReferenceEnum.TOP_RIGHT_POINT;
			var set_VJ = VerticalJustification.TOP_ALIGN;
			var set_PJ = Justification.RIGHT_ALIGN;
			break;
	}
	var set_oldAS = sel.textFramePreferences.autoSizingType;
	var set_oldVJ = sel.textFramePreferences.verticalJustification;
	switch (set_oldVJ) {
		case 1785951334: // VerticalJustification.JUSTIFY_ALIGN
			exit();
		case 1953460256: // VerticalJustification.TOP_ALIGN
			var cBefore = sel.resolve(AnchorPoint.TOP_CENTER_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES);
			sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_CENTER_POINT;
			sel.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;
			sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.BOTTOM_CENTER_POINT;
			sel.textFramePreferences.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
			sel.textFramePreferences.useNoLineBreaksForAutoSizing = true;
			var cAfter = sel.resolve(AnchorPoint.TOP_CENTER_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES);
			break;
		case 1667591796: // VerticalJustification.CENTER_ALIGN
			var cBefore = sel.resolve(AnchorPoint.CENTER_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES);
			sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.CENTER_POINT;
			sel.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;
			sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.BOTTOM_CENTER_POINT;
			sel.textFramePreferences.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
			sel.textFramePreferences.useNoLineBreaksForAutoSizing = true;
			var cAfter = sel.resolve(AnchorPoint.CENTER_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES);
			break;
		case 1651471469: // VerticalJustification.BOTTOM_ALIGN
			var cBefore = sel.resolve(AnchorPoint.BOTTOM_CENTER_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES);
			sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.BOTTOM_CENTER_POINT;
			sel.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;
			sel.textFramePreferences.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
			sel.textFramePreferences.useNoLineBreaksForAutoSizing = true;
			var cAfter = sel.resolve(AnchorPoint.BOTTOM_CENTER_ANCHOR, CoordinateSpaces.SPREAD_COORDINATES);
			break;
	}
	sel.textFramePreferences.autoSizingType = set_oldAS;
	var set_AST = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
	if (sel.lines.length > 1) {
		set_AST = sel.textFramePreferences.autoSizingType ==
		AutoSizingTypeEnum.OFF ? AutoSizingTypeEnum.HEIGHT_ONLY : AutoSizingTypeEnum.HEIGHT_AND_WIDTH
	}
	sel.textFramePreferences.properties = {
		autoSizingType: set_AST,
		autoSizingReferencePoint: set_AS,
		verticalJustification: set_oldVJ
	}
	sel.paragraphs.everyItem().justification = set_PJ;
}