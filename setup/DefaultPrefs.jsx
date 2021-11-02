/*
	Default preferences v1.5 (2021-11-02)
	(c) 2020-2021 Paul Chiorean (jpeg@basement.ro)

	Sets default preferences.

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

if (!(doc = app.activeDocument)) exit();

app.doScript(function () {
	app.properties = {
		activeWindow: {
			screenMode: ScreenModeOptions.PREVIEW_OFF,
			transformReferencePoint: AnchorPoint.CENTER_ANCHOR
		},
		clipboardPreferences: {
			pasteRemembersLayers: true
		},
		displayPerformancePreferences: {
			persistLocalSettings: true
		},
		generalPreferences: {
			includePreview: true,
			preventSelectingLockedItems: true,
			ungroupRemembersLayers: true
		},
		guidePreferences: {
			guidesSnapto: true
		},
		preflightOptions: {
			preflightOff: true
		},
		smartGuidePreferences: {
			enabled: true
		},
		transformPreferences: {
			adjustEffectsWhenScaling: true,
			adjustStrokeWeightWhenScaling: true
		}
	};
	doc.properties = {
		adjustLayoutPreferences: {
			enableAdjustLayout: false,
			allowFontSizeAndLeadingAdjustment: false,
			allowLockedObjectsToAdjust: false,
			enableAutoAdjustMargins: false
		},
		cmykProfile: 'ISO Coated v2 (ECI)',
		documentPreferences: {
			allowPageShuffle: false,
			preserveLayoutWhenShuffling: true,
			intent: DocumentIntentOptions.PRINT_INTENT
		},
		guidePreferences: {
			guidesLocked: false,
			guidesShown: true,
			guidesSnapto: true
		},
		layoutAdjustmentPreferences: {
			enableLayoutAdjustment: false
		},
		pageItemDefaults: {
			fillColor: 'None',
			fillTint: '-1',
			nonprinting: false,
			strokeColor: 'None',
			strokeTint: '-1',
			transparencySettings: {
				blendingSettings: {
					blendMode: BlendMode.NORMAL,
					opacity: 100
				}
			}
		},
		pasteboardPreferences: {
			// pasteboardMargins: ["150mm", "25mm"],
			previewBackgroundColor: UIColors.LIGHT_GRAY
		},
		rgbProfile: 'sRGB IEC61966-2.1',
		selection: [],
		textDefaults: { paragraphShadingOn: false },
		textPreferences: {
			baselineShiftKeyIncrement: '0.1pt',
			kerningKeyIncrement: 5,
			leadingKeyIncrement: '0.5pt',
			typographersQuotes: true,
			useParagraphLeading: true
		},
		transparencyPreferences: {
			blendingSpace: BlendingSpace.CMYK
		},
		viewPreferences: {
			cursorKeyIncrement: '0.2mm',
			horizontalMeasurementUnits: MeasurementUnits.MILLIMETERS,
			verticalMeasurementUnits: MeasurementUnits.MILLIMETERS,
			showFrameEdges: true,
			showRulers: true
		},
		zeroPoint: [ 0, 0 ]
	};
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set preferences');
