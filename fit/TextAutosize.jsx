/*
	Fit frame to text 22.4.5
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Auto-sizes the text frame to the content from 'None' to 'Height Only' to 'Height and Width'
	(single lines are always auto-sized 'Height and Width'). A second run tightens auto-sizing.
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

app.doScript(main, ScriptLanguage.JAVASCRIPT, doc.selection,
	UndoModes.ENTIRE_SCRIPT, 'Fit frame to text');

function main(selection) {
	if (Object.prototype.hasOwnProperty.call(selection[0], 'parentTextFrames'))
		selection = selection[0].parentTextFrames;
	for (var i = 0, n = selection.length; i < n; i++) {
		if (selection[i].allPageItems.length > 0) { // Also get child text frames
			for (var j = 0, childs = selection[i].allPageItems, m = childs.length; j < m; j++)
				if (childs[j].constructor.name === 'TextFrame') fitFrame2Text(childs[j]);
		} else if (selection[i].constructor.name === 'TextFrame') { fitFrame2Text(selection[i]); }
	}

	function fitFrame2Text(frame) {
		var align;
		var ASR = AutoSizingReferenceEnum;
		var VJ = VerticalJustification;
		var framePrefs = frame.textFramePreferences;
		var oldAST = framePrefs.autoSizingType;
		var oldASRP = framePrefs.autoSizingReferencePoint;

		// Trim ending whitespace
		if (!frame.overflows && /\s+$/g.test(frame.contents) && !frame.nextTextFrame)
			frame.contents = frame.contents.replace(/\s+$/g, '');
		// Disable hyphenation for single lines
		if (!frame.overflows && frame.lines.length === 1) frame.lines[0].hyphenation = false;
		// Skip 'HW' frames, they are already set
		if (/hw/gi.test(frame.label)) return;

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

		// Tighten frame
		switch (framePrefs.verticalJustification) {
			case VJ.TOP_ALIGN:
				framePrefs.autoSizingReferencePoint = ASR.TOP_CENTER_POINT;
				break;
			case VJ.CENTER_ALIGN:
				framePrefs.autoSizingReferencePoint = ASR.CENTER_POINT;
				break;
			case VJ.BOTTOM_ALIGN:
				framePrefs.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT;
				break;
		}
		if (framePrefs.verticalJustification !== VJ.JUSTIFY_ALIGN)
			framePrefs.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;

		// Fix first baseline offset
		switch (align) {
			case 'center':
				framePrefs.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT;
				break;
			case 'left':
				framePrefs.autoSizingReferencePoint = ASR.BOTTOM_LEFT_POINT;
				break;
			case 'right':
				framePrefs.autoSizingReferencePoint = ASR.BOTTOM_RIGHT_POINT;
				break;
		}
		framePrefs.firstBaselineOffset = FirstBaseline.CAP_HEIGHT;
		framePrefs.useNoLineBreaksForAutoSizing = true;

		// Set alignment
		switch (align) {
			case 'left':
				switch (framePrefs.verticalJustification) {
					case VJ.TOP_ALIGN:
						framePrefs.autoSizingReferencePoint = ASR.TOP_LEFT_POINT;
						break;
					case VJ.JUSTIFY_ALIGN:
					case VJ.CENTER_ALIGN:
						framePrefs.autoSizingReferencePoint = ASR.LEFT_CENTER_POINT;
						break;
					case VJ.BOTTOM_ALIGN:
						framePrefs.autoSizingReferencePoint = ASR.BOTTOM_LEFT_POINT;
						break;
				}
				break;
			case 'center':
				switch (framePrefs.verticalJustification) {
					case VJ.TOP_ALIGN:
						framePrefs.autoSizingReferencePoint = ASR.TOP_CENTER_POINT;
						break;
					case VJ.JUSTIFY_ALIGN:
					case VJ.CENTER_ALIGN:
						framePrefs.autoSizingReferencePoint = ASR.CENTER_POINT;
						break;
					case VJ.BOTTOM_ALIGN:
						framePrefs.autoSizingReferencePoint = ASR.BOTTOM_CENTER_POINT;
						break;
				}
				break;
			case 'right':
				switch (framePrefs.verticalJustification) {
					case VJ.TOP_ALIGN:
						framePrefs.autoSizingReferencePoint = ASR.TOP_RIGHT_POINT;
						break;
					case VJ.JUSTIFY_ALIGN:
					case VJ.CENTER_ALIGN:
						framePrefs.autoSizingReferencePoint = ASR.RIGHT_CENTER_POINT;
						break;
					case VJ.BOTTOM_ALIGN:
						framePrefs.autoSizingReferencePoint = ASR.BOTTOM_RIGHT_POINT;
						break;
				}
				break;
		}

		// Set frame auto-sizing
		if (framePrefs.verticalJustification === VJ.JUSTIFY_ALIGN) {
			framePrefs.autoSizingType = AutoSizingTypeEnum.WIDTH_ONLY;
			return;
		}
		if (frame.lines.length === 1) { // Tighten single lines
			framePrefs.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
		} else {
			switch (oldAST) {
				case AutoSizingTypeEnum.OFF:
					framePrefs.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;
					break;
				case AutoSizingTypeEnum.HEIGHT_AND_WIDTH:
				case AutoSizingTypeEnum.HEIGHT_AND_WIDTH_PROPORTIONALLY:
					// Already tightened
					break;
				case AutoSizingTypeEnum.HEIGHT_ONLY:
				case AutoSizingTypeEnum.WIDTH_ONLY:
					// Don't tighten when just the reference point was changed
					if (framePrefs.autoSizingReferencePoint !== oldASRP) break;
					// Break lines and increase tightening
					for (var i = 0, n = frame.paragraphs.length; i < n; i++) freezePara(frame.paragraphs[i]);
					framePrefs.autoSizingType = AutoSizingTypeEnum.HEIGHT_AND_WIDTH;
					break;
			}
			frame.fit(FitOptions.FRAME_TO_CONTENT);
		}
	}

	// Modified from Freeze Paragraphs v1.0.2 by Harbs, in-tools.com
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
