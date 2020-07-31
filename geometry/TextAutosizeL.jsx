/*
	Fit frame to text, left v1.6.0
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
	if (sel.textFramePreferences.verticalJustification == VerticalJustification.JUSTIFY_ALIGN) exit(); // WIP
	// Save settings
	var set_oldAS = sel.textFramePreferences.autoSizingType;
	var set_oldVJ = sel.textFramePreferences.verticalJustification;
	// Set auto-size reference point
	switch (set_oldVJ) {
		case VerticalJustification.TOP_ALIGN:
			sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_CENTER_POINT; break;
		case VerticalJustification.CENTER_ALIGN:
			sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.CENTER_POINT; break;
		case VerticalJustification.BOTTOM_ALIGN:
			sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.BOTTOM_CENTER_POINT; break;
	}
	// Resize frame
	sel.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;
	switch (align) {
		case "center":
			sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.BOTTOM_CENTER_POINT; break;
		case "left":
			sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.BOTTOM_LEFT_POINT; break;
		case "right":
			sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.BOTTOM_RIGHT_POINT; break;
	}
	sel.textFramePreferences.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
	sel.textFramePreferences.useNoLineBreaksForAutoSizing = true;
	// Set frame tightening
	if (sel.lines.length > 1) {
		sel.textFramePreferences.autoSizingType = set_oldAS == AutoSizingTypeEnum.OFF ?
			AutoSizingTypeEnum.HEIGHT_ONLY : AutoSizingTypeEnum.HEIGHT_AND_WIDTH
	} else {
		sel.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
	}
	// Set alignment
	switch (align) {
		case "center":
			switch (set_oldVJ) {
				case VerticalJustification.TOP_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_CENTER_POINT; break;
				case VerticalJustification.CENTER_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.CENTER_POINT; break;
				case VerticalJustification.BOTTOM_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.BOTTOM_CENTER_POINT; break;
			}
			sel.paragraphs.everyItem().justification = Justification.CENTER_ALIGN; break;
		case "left":
			switch (set_oldVJ) {
				case VerticalJustification.TOP_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_LEFT_POINT; break;
				case VerticalJustification.CENTER_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.LEFT_CENTER_POINT; break;
				case VerticalJustification.BOTTOM_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.BOTTOM_LEFT_POINT; break;
			}
			sel.paragraphs.everyItem().justification = Justification.LEFT_ALIGN; break;
		case "right":
			switch (set_oldVJ) {
				case VerticalJustification.TOP_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_RIGHT_POINT; break;
				case VerticalJustification.CENTER_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.RIGHT_CENTER_POINT; break;
				case VerticalJustification.BOTTOM_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.BOTTOM_RIGHT_POINT; break;
			}
			sel.paragraphs.everyItem().justification = Justification.RIGHT_ALIGN; break;
	}
}