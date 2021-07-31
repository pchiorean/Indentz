/*
	Fit frame to text v2.3.2 (2021-07-19)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Auto-sizes the text frame to the content from None to Height Only to Height and Width
	(single lines are always auto-sized Height and Width). A second run tightens auto-sizing.
	The first line's justification sets the horizontal alignment; vertical justification
	sets the vertical alignment.

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
if (doc.selection.length == 0) { exit() } else { var sel = doc.selection };

app.doScript(main, ScriptLanguage.javascript, sel,
	UndoModes.ENTIRE_SCRIPT, "Fit frame to text");


function main(sel) {
	if (sel[0].hasOwnProperty("parentTextFrames")) var sel = sel[0].parentTextFrames;
	for (var i = 0; i < sel.length; i++)
		if (sel[i].constructor.name == "TextFrame") FitFrame2Text(sel[i]);
};

function FitFrame2Text(frame) {
	const ASR = AutoSizingReferenceEnum;
	const VJ = VerticalJustification;
	var framePrefs = frame.textFramePreferences;
	var frameVJ = framePrefs.verticalJustification;
	var oldAST = framePrefs.autoSizingType;
	var oldASRP = framePrefs.autoSizingReferencePoint;
	var align;

	// Trim ending whitespace
	if (/\s+$/g.test(frame.contents) && frame.nextTextFrame == null)
		frame.contents = frame.contents.replace(/\s+$/g, "");
	// Disable hyphenation for single lines
	if (frame.lines.length == 1) frame.lines[0].hyphenation = false;
	// Skip 'HW' frames, they are already set
	if (/hw/gi.test(frame.label)) return;

	// Detect 1st paragraph's justification
	if (frame.lines.length == 0) return;
	switch (frame.lines[0].justification) {
		case Justification.LEFT_ALIGN:
		case Justification.LEFT_JUSTIFIED: align = "left"; break;
		case Justification.CENTER_ALIGN:
		case Justification.CENTER_JUSTIFIED:
		case Justification.FULLY_JUSTIFIED: align = "center"; break;
		case Justification.RIGHT_ALIGN:
		case Justification.RIGHT_JUSTIFIED: align = "right"; break;
		case Justification.AWAY_FROM_BINDING_SIDE:
			align = (frame.parentPage.side == PageSideOptions.LEFT_HAND) ? "left" : "right"; break;
		case Justification.TO_BINDING_SIDE:
			align = (frame.parentPage.side == PageSideOptions.LEFT_HAND) ? "right" : "left"; break;
	};
	// Tighten frame
	switch (frameVJ) {
		case VJ.TOP_ALIGN: framePrefs.autoSizingReferencePoint = ASR.TOP_CENTER_POINT; break;
		case VJ.CENTER_ALIGN: framePrefs.autoSizingReferencePoint = ASR.CENTER_POINT; break;
		case VJ.BOTTOM_ALIGN: framePrefs.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT; break;
	};
	if (frameVJ != VJ.JUSTIFY_ALIGN) framePrefs.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;
	// Fix first baseline offset
	switch (align) {
		case "center": framePrefs.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT; break;
		case "left": framePrefs.autoSizingReferencePoint = ASR.BOTTOM_LEFT_POINT; break;
		case "right": framePrefs.autoSizingReferencePoint = ASR.BOTTOM_RIGHT_POINT; break;
	};
	framePrefs.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
	framePrefs.useNoLineBreaksForAutoSizing = true;
	// Set alignment
	switch (align) {
		case "left":
			switch (frameVJ) {
				case VJ.TOP_ALIGN: framePrefs.autoSizingReferencePoint = ASR.TOP_LEFT_POINT; break;
				case VJ.JUSTIFY_ALIGN:
				case VJ.CENTER_ALIGN: framePrefs.autoSizingReferencePoint = ASR.LEFT_CENTER_POINT; break;
				case VJ.BOTTOM_ALIGN: framePrefs.autoSizingReferencePoint = ASR.BOTTOM_LEFT_POINT; break;
			};
			break;
		case "center":
			switch (frameVJ) {
				case VJ.TOP_ALIGN: framePrefs.autoSizingReferencePoint = ASR.TOP_CENTER_POINT; break;
				case VJ.JUSTIFY_ALIGN:
				case VJ.CENTER_ALIGN: framePrefs.autoSizingReferencePoint = ASR.CENTER_POINT; break;
				case VJ.BOTTOM_ALIGN: framePrefs.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT; break;
			};
			break;
		case "right":
			switch (frameVJ) {
				case VJ.TOP_ALIGN: framePrefs.autoSizingReferencePoint = ASR.TOP_RIGHT_POINT; break;
				case VJ.JUSTIFY_ALIGN:
				case VJ.CENTER_ALIGN: framePrefs.autoSizingReferencePoint = ASR.RIGHT_CENTER_POINT; break;
				case VJ.BOTTOM_ALIGN: framePrefs.autoSizingReferencePoint = ASR.BOTTOM_RIGHT_POINT; break;
			};
			break;
	};
	// Set frame auto-sizing
	if (frameVJ == VJ.JUSTIFY_ALIGN) { framePrefs.autoSizingType = AutoSizingTypeEnum.WIDTH_ONLY; return };
	if (frame.lines.length > 1) {
		framePrefs.autoSizingType = (oldAST == AutoSizingTypeEnum.OFF) ?
		AutoSizingTypeEnum.HEIGHT_ONLY :
		// Keep Height Only when just reference point is changed
		(framePrefs.autoSizingReferencePoint != oldASRP ?
			AutoSizingTypeEnum.HEIGHT_ONLY : AutoSizingTypeEnum.HEIGHT_AND_WIDTH)
	} else framePrefs.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
};
