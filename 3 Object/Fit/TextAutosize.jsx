/*
	Fit frame to text 24.11.5
	(c) 2020-2024 Paul Chiorean <jpeg@basement.ro>

	Auto-sizes the text frame to the content from 'None' to 'Height Only' to 'Height and Width'
	(single lines are always auto-sized 'Height and Width'). A second run increases auto-sizing.
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

if (!(doc = app.activeDocument) || doc.selection.length === 0) exit();

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection, UndoModes.ENTIRE_SCRIPT, 'Fit frame to text');

function main(selection) {
	var old = {};

	if (Object.prototype.hasOwnProperty.call(selection[0], 'parentTextFrames'))
		selection = selection[0].parentTextFrames;

	for (var i = 0, n = selection.length; i < n; i++) {
		if (selection[i].allPageItems.length > 0) { // Also get child text frames
			for (var j = 0, childs = selection[i].allPageItems, m = childs.length; j < m; j++)
				if (childs[j].constructor.name === 'TextFrame') fitFrame2Text(childs[j]);
		} else if (selection[i].constructor.name === 'TextFrame') { fitFrame2Text(selection[i]); }
	}

	function fitFrame2Text(/*TextFrame*/frame) {
		var align;
		var ASR = AutoSizingReferenceEnum;
		var VJ = VerticalJustification;
		old = {
			AST:  frame.textFramePreferences.autoSizingType,
			ASRP: frame.textFramePreferences.autoSizingReferencePoint
		};

		// Trim ending whitespace (using Find/Change GREP to preserve text styling)
		if (!frame.overflows
				&& /\s+$/g.test(frame.contents)
				&& !frame.previousTextFrame && !frame.nextTextFrame) {
			old.findWhat = app.findGrepPreferences.findWhat;
			old.changeTo = app.changeGrepPreferences.changeTo;
			app.findGrepPreferences.findWhat   = '\\s+$';
			app.changeGrepPreferences.changeTo = '';
			frame.changeGrep();
			app.findGrepPreferences.findWhat   = old.findWhat;
			app.changeGrepPreferences.changeTo = old.changeTo;
		}

		// Skip color-filled frames
		if (frame.fillColor.name !== 'None' || frame.strokeColor.name !== 'None') return;

		// Disable hyphenation for single lines
		if (!frame.overflows && frame.lines.length === 1) frame.lines[0].hyphenation = false;

		// Detect 1st paragraph's justification
		if (frame.lines.length === 0) return;
		switch (frame.lines[0].justification) {
			case Justification.LEFT_ALIGN:
			case Justification.LEFT_JUSTIFIED:
				align = 'left';
				break;
			case Justification.CENTER_ALIGN:
			case Justification.CENTER_JUSTIFIED:
			case Justification.FULLY_JUSTIFIED:
				align = 'center';
				break;
			case Justification.RIGHT_ALIGN:
			case Justification.RIGHT_JUSTIFIED:
				align = 'right';
				break;
			case Justification.AWAY_FROM_BINDING_SIDE:
				align = (frame.parentPage.side === PageSideOptions.LEFT_HAND) ? 'left' : 'right';
				break;
			case Justification.TO_BINDING_SIDE:
				align = (frame.parentPage.side === PageSideOptions.LEFT_HAND) ? 'right' : 'left';
				break;
		}

		// Auto-size frame, 1st pass
		switch (frame.textFramePreferences.verticalJustification) {
			case VJ.TOP_ALIGN:
				frame.textFramePreferences.autoSizingReferencePoint = ASR.TOP_CENTER_POINT;
				break;
			case VJ.CENTER_ALIGN:
				frame.textFramePreferences.autoSizingReferencePoint = ASR.CENTER_POINT;
				break;
			case VJ.BOTTOM_ALIGN:
				frame.textFramePreferences.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT;
				break;
		}
		if (frame.textFramePreferences.verticalJustification !== VJ.JUSTIFY_ALIGN)
			frame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;

		// Fix first baseline offset
		switch (align) {
			case 'center':
				frame.textFramePreferences.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT;
				break;
			case 'left':
				frame.textFramePreferences.autoSizingReferencePoint = ASR.BOTTOM_LEFT_POINT;
				break;
			case 'right':
				frame.textFramePreferences.autoSizingReferencePoint = ASR.BOTTOM_RIGHT_POINT;
				break;
		}
		frame.textFramePreferences.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
		frame.textFramePreferences.useNoLineBreaksForAutoSizing = true;
		frame.textFramePreferences.autoSizingType = old.AST;

		// Set auto-sizing reference point for alignment
		switch (align) {
			case 'left':
				switch (frame.textFramePreferences.verticalJustification) {
					case VJ.TOP_ALIGN:
						frame.textFramePreferences.autoSizingReferencePoint = ASR.TOP_LEFT_POINT;
						break;
					case VJ.JUSTIFY_ALIGN:
					case VJ.CENTER_ALIGN:
						frame.textFramePreferences.autoSizingReferencePoint = ASR.LEFT_CENTER_POINT;
						break;
					case VJ.BOTTOM_ALIGN:
						frame.textFramePreferences.autoSizingReferencePoint = ASR.BOTTOM_LEFT_POINT;
						break;
				}
				break;
			case 'center':
				switch (frame.textFramePreferences.verticalJustification) {
					case VJ.TOP_ALIGN:
						frame.textFramePreferences.autoSizingReferencePoint = ASR.TOP_CENTER_POINT;
						break;
					case VJ.JUSTIFY_ALIGN:
					case VJ.CENTER_ALIGN:
						frame.textFramePreferences.autoSizingReferencePoint = ASR.CENTER_POINT;
						break;
					case VJ.BOTTOM_ALIGN:
						frame.textFramePreferences.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT;
						break;
				}
				break;
			case 'right':
				switch (frame.textFramePreferences.verticalJustification) {
					case VJ.TOP_ALIGN:
						frame.textFramePreferences.autoSizingReferencePoint = ASR.TOP_RIGHT_POINT;
						break;
					case VJ.JUSTIFY_ALIGN:
					case VJ.CENTER_ALIGN:
						frame.textFramePreferences.autoSizingReferencePoint = ASR.RIGHT_CENTER_POINT;
						break;
					case VJ.BOTTOM_ALIGN:
						frame.textFramePreferences.autoSizingReferencePoint = ASR.BOTTOM_RIGHT_POINT;
						break;
				}
				break;
		}

		// Auto-size frame, 2nd pass
		if (frame.textFramePreferences.verticalJustification === VJ.JUSTIFY_ALIGN) {
			frame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.WIDTH_ONLY;
			return;
		}
		if (frame.lines.length === 1) { // Single lines
			frame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
		} else { // Multiple lines
			switch (frame.textFramePreferences.autoSizingType) {
				case AutoSizingTypeEnum.OFF:
					frame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;
					break;
				case AutoSizingTypeEnum.HEIGHT_AND_WIDTH:
				case AutoSizingTypeEnum.HEIGHT_AND_WIDTH_PROPORTIONALLY:
					break; // Already tightened
				case AutoSizingTypeEnum.HEIGHT_ONLY:
				case AutoSizingTypeEnum.WIDTH_ONLY:
					// The reference point was changed, skip auto-sizing
					if (frame.textFramePreferences.autoSizingReferencePoint !== old.ASRP) break;
					// Else freeze paragraphs and increase auto-sizing
					for (var i = 0, n = frame.paragraphs.length; i < n; i++) freezePara(frame.paragraphs[i]);
					frame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
					break;
			}
			frame.fit(FitOptions.FRAME_TO_CONTENT);
		}
	}

	// Adapted from Freeze Paragraphs v1.0.2 by Harbs, in-tools.com
	// http://in-tools.com/article/scripts-blog/freeze-composition/
	function freezePara(paragraph) {
		for (var i = 0, n = paragraph.lines.length, line; i < n - 1; i++) {
			line = paragraph.lines[i];
			if (/-?\u000A$/.test(line.contents)) continue;
			if (line.words[-1].lines.length > 1 && line.characters[-1].contents !== '-')
				line.characters[-1].insertionPoints[1].contents = '-\u000A';
			else line.characters[-1].insertionPoints[1].contents = '\u000A';
		}
	}
}
