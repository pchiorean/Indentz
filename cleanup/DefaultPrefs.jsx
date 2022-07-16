/*
	Default preferences 22.4.15
	(c) 2020-2022 Paul Chiorean (jpeg@basement.ro)

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
		documentPreferences: {
			allowPageShuffle: false,
			preserveLayoutWhenShuffling: true,
			intent: DocumentIntentOptions.PRINT_INTENT
		},
		gridPreferences: {
			baselineColor: [ 230, 230, 230 ]
			// gridColor: UIColors.LIGHT_GRAY
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
			showRulers: true,
			rulerOrigin: RulerOrigin.SPREAD_ORIGIN,
			strokeMeasurementUnits: MeasurementUnits.POINTS,
			textSizeMeasurementUnits: MeasurementUnits.POINTS,
			typographicMeasurementUnits: MeasurementUnits.POINTS
		},
		zeroPoint: [ 0, 0 ]
	};
	try {
		doc.cmykProfile = 'ISO Coated v2 (ECI)';
	} catch (e) {
		doc.cmykProfile = 'Coated FOGRA39 (ISO 12647-2:2004)';
	}
},
ScriptLanguage.JAVASCRIPT, undefined,
UndoModes.ENTIRE_SCRIPT, 'Set preferences');
