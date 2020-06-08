/*
	Fit frame to text, left v1.2.1
	© June 2020, Paul Chiorean
	This script auto-sizes the text frame to the content.
*/

if (app.documents.length == 0) exit();
var doc = app.activeDocument;
var selObj = doc.selection;

if (selObj.length == 1 && selObj[0].constructor.name == "InsertionPoint") {
	var sel = selObj[0].parentTextFrames[0];
	sel.fit(FitOptions.FRAME_TO_CONTENT);
	sel.textFramePreferences.properties = {
		autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_CENTER_POINT,
		firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
		useNoLineBreaksForAutoSizing: true
	}
	sel.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
	sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.CENTER_POINT;
} else if (selObj.length > 0 && selObj[0].constructor.name == "TextFrame") {
	for (i = 0; i < selObj.length; i++) {
		var sel = selObj[i];
		sel.fit(FitOptions.FRAME_TO_CONTENT);
		sel.textFramePreferences.properties = {
			autoSizingReferencePoint: AutoSizingReferenceEnum.BOTTOM_LEFT_POINT,
			firstBaselineOffset: FirstBaseline.CAP_HEIGHT,
			useNoLineBreaksForAutoSizing: true
		}
		sel.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
		sel.textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_LEFT_POINT;
	}
} else alert("Select a text frame and try again.");