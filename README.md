# ntc-ts

[Name That Color](https://chir.ag/projects/ntc/) as a TypeScript library. It includes the original color list, a smaller palette, custom palettes, and a lookup cache.

## Install

```sh
npm install ntc-ts
```

`ntc-ts` requires Node.js 18 or newer.

## ESM

```ts
import { getColorName, initColors, ORIGINAL_COLORS } from 'ntc-ts'

// Until initialized, the palette contains only Black.
initColors(ORIGINAL_COLORS)

getColorName('#000')
// { exactMatch: true, name: 'Black', rgb: '#000000' }

getColorName('#9399A7')
// { exactMatch: false, name: 'Manatee', rgb: '#8D90A1' }

getColorName('this is not a color')
// { exactMatch: false, name: 'not-a-color', rgb: null }
```

Inputs may be three- or six-digit hexadecimal colors, with or without `#`. Output hex values are normalized to uppercase six-digit values. For a closest match, `rgb` is the matched palette color rather than the input color.

## CommonJS

```js
const { getColorName, initColors, MINIMAL_COLORS } = require('ntc-ts')

initColors(MINIMAL_COLORS)
console.log(getColorName('#f00'))
```

## Browser global (IIFE)

The package's `unpkg` entry points to an IIFE bundle. It exposes the API as `ntcTs`:

```html
<script src="https://unpkg.com/ntc-ts@0.1.0"></script>
<script>
  ntcTs.initColors(ntcTs.MINIMAL_COLORS)
  console.log(ntcTs.getColorName('#f00'))
</script>
```

Pin a version in production instead of using an unversioned CDN URL.

## Palettes

Two palettes are included:

- `ORIGINAL_COLORS`: the complete color set from the original project.
- `MINIMAL_COLORS`: a smaller selection of common colors.

Only Black is available before the first call to `initColors`. To use a custom palette:

```ts
import { getColorName, initColors } from 'ntc-ts'
import type { COLOR } from 'ntc-ts'

const brandColors: COLOR[] = [
  ['0F0', 'Brand Green'],
  ['663399', 'Brand Purple']
]

initColors(brandColors)
getColorName('#00ff00')
// { exactMatch: true, name: 'Brand Green', rgb: '#00FF00' }
```

Each `COLOR` tuple starts with a three- or six-digit hex value (with or without `#`) and a name. Invalid entries are ignored. Optional RGB/HSL numeric fields are supported for compatibility, but normally should be omitted; the library calculates them lazily.

## Cache and global state

Palette and cache state are shared by all consumers of a loaded module instance:

- `initColors(palette)` replaces the current palette and clears cached lookup results.
- `getColorName(color)` caches and returns the same result object for repeated normalized inputs.
- `flushCachedColors()` clears lookup results only. It does not reset the palette or remove lazily calculated values from the library's internal palette copy.
- `colors` and `cachedColors` are live exported state intended for inspection and backwards compatibility.

Because `initColors` changes module-global state, initialize once during application startup. Avoid switching palettes between concurrent requests; isolate module instances or serialize access if different consumers require different palettes.

## Migrating to 0.1.0

Version 0.1.0 tightened invalid-input behavior without changing the exported function names:

- `COLOR` is a typed tuple. Custom palettes start with a hex string and color name, followed by optional cached RGB/HSL numbers.
- `getColorName` accepts only valid three- or six-digit hexadecimal strings, with or without `#`. Missing or malformed values return `{ exactMatch: false, name: 'not-a-color', rgb: null }`.
- Custom palette hex values are normalized; malformed palette entries are dropped.
- The default palette before `initColors` contains only Black. Applications that relied on another palette being implicit must call `initColors` explicitly.

## Original credits

- Some code from [Farbtastic](http://www.acko.net/dev/farbtastic) by [Steven Wittens](http://www.acko.net/) was incorporated into the original [ntc](https://chir.ag/projects/ntc/) JavaScript library.
- The [Resene RGB Values List](http://www-swiss.ai.mit.edu/~jaffer/Color/resenecolours.txt) is copyrighted to [Resene Paints Ltd](http://www.resene.co.nz/), 2001.
- The color names were sourced from [Wikipedia](http://en.wikipedia.org/wiki/List_of_colors), [Crayola](http://en.wikipedia.org/wiki/List_of_Crayola_crayon_colors), and [Color-Name Dictionaries](http://www-swiss.ai.mit.edu/~jaffer/Color/Dictionaries.html).

## License

This package is licensed under [CC BY 4.0](LICENSE). The original ntc JavaScript library was released under [CC BY 2.5](https://creativecommons.org/licenses/by/2.5/).
