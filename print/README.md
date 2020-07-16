These are making some preparations for export and can be run in **batch_convert.jsx**.

The scripts detect alternative layer names like `visible`, `vizibil`, `vis. area` for `safe area`, or `diecut`, `die cut`, `cut lines`, `stanze` for `dielines`.

## PrepareForPrint
* Hides the `safe area` layer;
* Moves UV markings from `varnish` to separate spreads;
* Moves the dielines from `dielines` to separate spreads.

## SafeArea
Creates a frame the size of the page margins on the `safe area` layer. Its color is a swatch, `Safe area`, which if it does not already exist will be created with the value "C=0 M=100 Y=0 K=0".

## SafeAreaHideLayer/SafeAreaShowLayer
Hide or show `safe area`.