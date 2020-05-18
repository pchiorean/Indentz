/*
	Fit frame to text, left v1.0.0
	© May 2020, Paul Chiorean
	This script auto-sizes the text frame to the content.
*/

var doc = app.activeDocument;
var sel = doc.selection;

if (sel.length > 0 && sel[0].constructor.name == "TextFrame") {
	sel[0].fit(FitOptions.FRAME_TO_CONTENT);
	sel[0].textFramePreferences.properties = {
		autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		useNoLineBreaksForAutoSizing: true
	}
	sel[0].textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
	sel[0].textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_LEFT_POINT;
} else alert("Select a text frame and try again.");