/*
	Show properties 23.12.12
	(c) 2020-2023 Paul Chiorean <jpeg@basement.ro>

	Shows properties and methods of the selected object/active document/the application.

	Inspired by:
	https://github.com/grefel/indesignjs/blob/version2/Allgemeine_Skripte/EigenschaftenAnzeigen.jsx
	https://github.com/basiljs/basil.js/blob/master/src/includes/environment.js

	Released under MIT License:
	https://choosealicense.com/licenses/mit/
*/

// @includepath '.;./lib;../lib';
// @include 'report.jsxinc';

var target = app;
if (app.documents.length > 0) target = app.documents[0];
if (app.documents.length > 0 && app.selection.length > 0) target = app.selection[0];

var methods;
var propsList = [];
var maxLevel = 3;

// Properties
inspect(target);

// Methods
propsList.push('\nMETHODS:');
methods = target.reflect.methods.sort();

for (var i = 0, n = methods.length; i < n; i++) {
	if (methods[i].toString() === '==' || methods[i].toString() === '===') continue;
	propsList.push(methods[i].name + '() (Method)');
}

report(propsList, target.reflect.name + ' | ' + target.toSource(), true);

function inspect(obj, prefix, level) {
	var val, str;
	var props = obj.reflect.properties.sort();

	prefix = prefix || '';
	level = level || 1;
	if (level > maxLevel) return;

	for (var i = 0, n = props.length; i < n; i++) {
		if (props[i].toString()     === '__proto__'
			|| props[i].toString()  === 'properties'
			|| props[i].toString()  === 'isValid'
			|| (props[i].toString() === 'length' && obj[props[i]] === 0)
			|| !Object.prototype.hasOwnProperty.call(obj, props[i])
		) continue;

		str = '';
		try {
			val = obj[props[i]];
			if (val == null) continue;
			switch (val.constructor.name) {
				case 'Array'     : str = '[ ' + val.join(', ') + ' ] (Array)'; break;
				case 'Boolean'   : str = val + ' (Boolean)'; break;
				case 'Color'     : str = '[ ' + val.colorValue + " ] '" + val.name + "' (Color)"; break;
				case 'Document'  : str = "'" + val.name + "' (Document)"; break;
				case 'Enumerator': str = val + ' (' + (val).toString() + ') (Enumerator)'; break;
				case 'Font'      : str = val.name.replace(/\t/g, ' ') + ' (Font)' ; break;
				case 'Layer'     : str = "'" + val.name + "' (Layer)"; break;
				case 'Number'    : str = val + ' (Number)' ; break;
				case 'Page'      : str = val.index + ' (Page)'; break;
				case 'Spread'    : str = val.index + ' (Spread)'; break;
				case 'String'    : str = "'" + val + "' (String)"; break;
				case 'Swatch'    : str = "'" + val.name + "' (Swatch)"; break;
				default          : str = '[' + val.constructor.name + ']';
			}
		} catch (e) { str = 'N/A'; }

		propsList.push((level === 1 && propsList.length > 0 ? '\n' : '') + prefix + props[i] + ' = ' + str);

		if (val != null && str !== 'N/A' && val.reflect.properties.length > 1) {
			if (/^parent.*/gi.test(props[i].toString())) continue;
			inspect(val, prefix + props[i] + '.', level + 1);
		}
	}
}
