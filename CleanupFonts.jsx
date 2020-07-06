/*
	Normalize fonts 1.0.2
	© June 2020, Paul Chiorean
	This script replaces missing or unwanted fonts with their equivalents.
*/

if (app.documents.length == 0) exit();

// From: "Name\tStyle", to: "Name\tStyle"
const fontList = [
	["Akzidenz Grotesk\tBold", "AkzidenzGrotesk\tBold"],
	["Arial\tBold", "Helvetica Neue\tBold"],
	["FoundryGridnik\tRegular", "Foundry Gridnik\tRegular"],
	["FoundryGridnik\tBold", "Foundry Gridnik\tBold"],
	["FoundryGridnik\tMedium", "Foundry Gridnik\tMedium"],
	["Gotham Light\tRegular", "Gotham\tLight"],
	["Gotham Book\tRegular", "Gotham\tBook"],
	["Gotham Medium\tRegular", "Gotham\tMedium"],
	["Gotham Bold\tRegular", "Gotham\tBold"],
	["Gotham Black\tRegular", "Gotham\tBlack"],
	["Helvetica Neue LT Std\t65 Medium", "Helvetica Neue\tMedium"],
	["Helvetica Neue LT Std\t75 Bold", "Helvetica Neue\tBold"],
	["Trade Gothic LT Std\tBold Condensed No. 20", "Trade Gothic for LS\tBold Condensed No. 20"],
	["Trade Gothic LT Std\tCondensed No. 18", "Trade Gothic for LS\tCondensed No. 18"],
];

app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
for (var i = 0; i < fontList.length; i++) {
	app.findChangeTextOptions.includeHiddenLayers =
	app.findChangeTextOptions.includeLockedLayersForFind =
	app.findChangeTextOptions.includeLockedStoriesForFind =
	app.findChangeTextOptions.includeMasterPages = true;
	app.findTextPreferences.appliedFont = fontList[i][0];
	app.changeTextPreferences.appliedFont = fontList[i][1];
	app.activeDocument.changeText();
	app.findTextPreferences = app.changeTextPreferences = NothingEnum.NOTHING;
}