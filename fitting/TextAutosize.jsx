/*
	Fit frame to text v1.8.0
	© October 2020, Paul Chiorean
	Auto-sizes the text frame to the content. 1st paragraph's justification sets
	horizontal alignment; vertical justification sets vertical alignment.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
if (doc.selection.length == 0) { exit() } else { var sel = doc.selection };

app.doScript(main, ScriptLanguage.javascript, sel,
	UndoModes.ENTIRE_SCRIPT, "Fit frame to text");


function main(sel) {
	if (sel[0].hasOwnProperty("parentTextFrames")) var sel = sel[0].parentTextFrames;
	for (var i = 0; i < sel.length; i++) {
		var obj = sel[i]; if (obj.constructor.name == "TextFrame") FitFrame2Text(obj);
	}
}

function FitFrame2Text(sel) {
	// JUSTIFY_ALIGN is a special case
	if (sel.textFramePreferences.verticalJustification == VerticalJustification.JUSTIFY_ALIGN) {
		sel.textFramePreferences.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
		exit();
	}
	// Detect 1st paragraph's justification
	if (sel.paragraphs.length == 0) return;
	switch (sel.paragraphs[0].justification) {
		case Justification.LEFT_ALIGN:
		case Justification.LEFT_JUSTIFIED:
			var align = "left"; break;
		case Justification.CENTER_ALIGN:
		case Justification.CENTER_JUSTIFIED:
		case Justification.FULLY_JUSTIFIED:
			var align = "center"; break;
		case Justification.RIGHT_ALIGN:
		case Justification.RIGHT_JUSTIFIED:
			var align = "right"; break;
		default: var align = "center";
	}
	// Save settings
	var set_oldAS = sel.textFramePreferences.autoSizingType;
	var set_oldVJ = sel.textFramePreferences.verticalJustification;
	// Set auto-size reference point
	switch (set_oldVJ) {
		case VerticalJustification.TOP_ALIGN:
			sel.textFramePreferences.autoSizingReferencePoint =
				AutoSizingReferenceEnum.TOP_CENTER_POINT; break;
		case VerticalJustification.CENTER_ALIGN:
			sel.textFramePreferences.autoSizingReferencePoint =
				AutoSizingReferenceEnum.CENTER_POINT; break;
		case VerticalJustification.BOTTOM_ALIGN:
			sel.textFramePreferences.autoSizingReferencePoint =
				AutoSizingReferenceEnum.BOTTOM_CENTER_POINT; break;
	}
	// Resize frame
	sel.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;
	switch (align) {
		case "center":
			sel.textFramePreferences.autoSizingReferencePoint =
				AutoSizingReferenceEnum.BOTTOM_CENTER_POINT; break;
		case "left":
			sel.textFramePreferences.autoSizingReferencePoint =
				AutoSizingReferenceEnum.BOTTOM_LEFT_POINT; break;
		case "right":
			sel.textFramePreferences.autoSizingReferencePoint =
				AutoSizingReferenceEnum.BOTTOM_RIGHT_POINT; break;
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
	// 1st paragraph's justification sets horizontal alignment
	// Vertical justification sets vertical alignment
	switch (align) {
		case "center":
			switch (set_oldVJ) {
				case VerticalJustification.TOP_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint =
						AutoSizingReferenceEnum.TOP_CENTER_POINT; break;
				case VerticalJustification.CENTER_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint =
						AutoSizingReferenceEnum.CENTER_POINT; break;
				case VerticalJustification.BOTTOM_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint =
						AutoSizingReferenceEnum.BOTTOM_CENTER_POINT; break;
			}
			break;
		case "left":
			switch (set_oldVJ) {
				case VerticalJustification.TOP_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint =
						AutoSizingReferenceEnum.TOP_LEFT_POINT; break;
				case VerticalJustification.CENTER_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint =
						AutoSizingReferenceEnum.LEFT_CENTER_POINT; break;
				case VerticalJustification.BOTTOM_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint =
						AutoSizingReferenceEnum.BOTTOM_LEFT_POINT; break;
			}
			break;
		case "right":
			switch (set_oldVJ) {
				case VerticalJustification.TOP_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint =
						AutoSizingReferenceEnum.TOP_RIGHT_POINT; break;
				case VerticalJustification.CENTER_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint =
						AutoSizingReferenceEnum.RIGHT_CENTER_POINT; break;
				case VerticalJustification.BOTTOM_ALIGN:
					sel.textFramePreferences.autoSizingReferencePoint =
						AutoSizingReferenceEnum.BOTTOM_RIGHT_POINT; break;
			}
			break;
	}
}
