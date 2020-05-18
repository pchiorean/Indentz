/*
	Fit frame to text, left v1.1.0
	© May 2020, Paul Chiorean
	This script auto-sizes the text frame to the content.
*/

var doc = app.activeDocument;
var selObj = doc.selection;

if (selObj.length > 0 && selObj[0].constructor.name == "TextFrame") {
	for (i = 0; i < selObj.length; i++) {
		selObj[i].fit(FitOptions.FRAME_TO_CONTENT);
		selObj[i].textFramePreferences.properties = {
			autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
			firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
			useNoLineBreaksForAutoSizing: true
		}
		selObj[i].textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
		selObj[i].textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_LEFT_POINT;
	}
} else alert("Select a text frame and try again.");