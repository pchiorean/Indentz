/*
	Default preferences v1.2
	© April 2021, Paul Chiorean
	Sets default preferences.
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(function() {
	app.properties = {
		activeWindow: {
			screenMode: ScreenModeOptions.PREVIEW_OFF,
			transformReferencePoint: AnchorPoint.CENTER_ANCHOR,
		},
		clipboardPreferences: {
			pasteRemembersLayers: true,
		},
		displayPerformancePreferences: {
			persistLocalSettings: true,
		},
		generalPreferences: {
			includePreview: true,
			preventSelectingLockedItems: true,
			ungroupRemembersLayers: true,
		},
		preflightOptions: {
			preflightOff: true,
		},
		transformPreferences: {
			adjustEffectsWhenScaling: true,
			adjustStrokeWeightWhenScaling: true,
		},
	}
	doc.properties = {
		cmykProfile: "ISO Coated v2 (ECI)",
		documentPreferences: {
			allowPageShuffle: false,
			preserveLayoutWhenShuffling: true,
			intent: DocumentIntentOptions.PRINT_INTENT,
		},
		guidePreferences: {
			guidesLocked: false,
			guidesShown: true,
		},
		pageItemDefaults: {
			fillColor: "None",
			strokeColor: "None",
			transparencySettings: {
				blendingSettings: {
					blendMode: BlendMode.NORMAL,
					opacity: 100,
				}
			}
		},
		pasteboardPreferences: {
			// pasteboardMargins: ["150mm", "25mm"],
			previewBackgroundColor: UIColors.LIGHT_GRAY,
		},
		rgbProfile: "sRGB IEC61966-2.1",
		selection: [],
		textPreferences: {
			baselineShiftKeyIncrement: "0.1pt",
			kerningKeyIncrement: 5,
			leadingKeyIncrement: "0.5pt",
			typographersQuotes: true,
			useParagraphLeading: true,
		},
		transparencyPreferences: {
			blendingSpace: BlendingSpace.CMYK,
		},
		viewPreferences: {
			cursorKeyIncrement: "0.2mm",
			horizontalMeasurementUnits: MeasurementUnits.MILLIMETERS,
			verticalMeasurementUnits: MeasurementUnits.MILLIMETERS,
			showFrameEdges: true,
			showRulers: true,
		},
		zeroPoint: [0, 0],
	}
},
ScriptLanguage.javascript, undefined,
UndoModes.ENTIRE_SCRIPT, "Set preferences");
