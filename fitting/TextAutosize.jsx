/*
	Fit frame to text v2.0
	© April 2021, Paul Chiorean
	Auto-sizes the text frame to the content.

	First line's justification sets horizontal alignment;
	vertical justification sets vertical alignment.
*/

if (!(doc = app.activeDocument)) exit();
if (doc.selection.length == 0) { exit() } else { var sel = doc.selection };

app.doScript(main, ScriptLanguage.javascript, sel,
	UndoModes.ENTIRE_SCRIPT, "Fit frame to text");


function main(sel) {
	if (sel[0].hasOwnProperty("parentTextFrames")) var sel = sel[0].parentTextFrames;
	for (var i = 0; i < sel.length; i++)
		if (sel[i].constructor.name == "TextFrame") FitFrame2Text(sel[i]);
}

function FitFrame2Text(frame) {
	const ASR = AutoSizingReferenceEnum;
	const VJ = VerticalJustification;
	var framePrefs = frame.textFramePreferences;
	var oldAST = framePrefs.autoSizingType;
	var oldASRP = framePrefs.autoSizingReferencePoint;

	// Special cases
	// -- 'HW' text frames are already set
	if (frame.label == "HW") return;
	// -- Vertically justified text
	if (framePrefs.verticalJustification == VJ.JUSTIFY_ALIGN) {
		framePrefs.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
		return;
	}

	// Trim ending whitespace
	if (/\s$/.test(frame.contents) && frame.startTextFrame.index == frame.endTextFrame.index)
		frame.contents = frame.contents.replace(/\s+$/, "");
	// Disable hyphenation for single lines
	if (frame.lines.length == 1) frame.lines[0].hyphenation = false;

	// Preliminary
	switch (framePrefs.verticalJustification) {
		case VJ.TOP_ALIGN: framePrefs.autoSizingReferencePoint = ASR.TOP_CENTER_POINT; break;
		case VJ.CENTER_ALIGN: framePrefs.autoSizingReferencePoint = ASR.CENTER_POINT; break;
		case VJ.BOTTOM_ALIGN: framePrefs.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT; break;
	}
	framePrefs.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;

	// Horizontal alignment
	switch (frame.lines[0].justification) {
		case Justification.LEFT_ALIGN:
		case Justification.LEFT_JUSTIFIED:
			framePrefs.autoSizingReferencePoint = ASR.BOTTOM_LEFT_POINT; break;
		case Justification.CENTER_ALIGN:
		case Justification.CENTER_JUSTIFIED:
		case Justification.FULLY_JUSTIFIED:
			framePrefs.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT; break;
		case Justification.RIGHT_ALIGN:
		case Justification.RIGHT_JUSTIFIED:
			framePrefs.autoSizingReferencePoint = ASR.BOTTOM_RIGHT_POINT; break;
		default:
			framePrefs.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT;
	}
	framePrefs.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
	framePrefs.useNoLineBreaksForAutoSizing = true;

	// Vertical alignment
	switch (framePrefs.autoSizingReferencePoint) {
		case ASR.BOTTOM_LEFT_POINT: switch (framePrefs.verticalJustification) {
			case VJ.TOP_ALIGN: framePrefs.autoSizingReferencePoint = ASR.TOP_LEFT_POINT; break;
			case VJ.CENTER_ALIGN: framePrefs.autoSizingReferencePoint = ASR.LEFT_CENTER_POINT; break;
			case VJ.BOTTOM_ALIGN: framePrefs.autoSizingReferencePoint = ASR.BOTTOM_LEFT_POINT; break }
			break;
		case ASR.BOTTOM_CENTER_POINT: switch (framePrefs.verticalJustification) {
			case VJ.TOP_ALIGN: framePrefs.autoSizingReferencePoint = ASR.TOP_CENTER_POINT; break;
			case VJ.CENTER_ALIGN: framePrefs.autoSizingReferencePoint = ASR.CENTER_POINT; break;
			case VJ.BOTTOM_ALIGN: framePrefs.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT; break }
			break;
		case ASR.BOTTOM_RIGHT_POINT: switch (framePrefs.verticalJustification) {
			case VJ.TOP_ALIGN: framePrefs.autoSizingReferencePoint = ASR.TOP_RIGHT_POINT; break;
			case VJ.CENTER_ALIGN: framePrefs.autoSizingReferencePoint = ASR.RIGHT_CENTER_POINT; break;
			case VJ.BOTTOM_ALIGN: framePrefs.autoSizingReferencePoint = ASR.BOTTOM_RIGHT_POINT; break }
			break;
	}

	// Frame auto-sizing
	if (frame.lines.length > 1) {
		framePrefs.autoSizingType =
			(oldAST == AutoSizingTypeEnum.OFF) ?
			AutoSizingTypeEnum.HEIGHT_ONLY :
			(framePrefs.autoSizingReferencePoint != oldASRP ?
				AutoSizingTypeEnum.HEIGHT_ONLY : AutoSizingTypeEnum.HEIGHT_AND_WIDTH)
	} else {
		framePrefs.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
	}
}
