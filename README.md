# NTC, but TS

Extract the work of [NTC](https://chir.ag/projects/ntc/) - "Name That Color" - as a typescript library, with a few more features:

- caches colors already found, instead of looping through the array of available color
- exposes function to update the available colors

## Live Demo of ntc

Try [Name that Color](https://chir.ag/projects/name-that-color/)!

## How to use

See the example below:

```ts
import { getColorName } from "ntc-ts";

/*
// Returns a formatted color object FORMATTED_COLOR
type FORMATTED_COLOR = {
    exactMatch: boolean;
    name: string;a
    rgb: string | null;
};
*/

const color01 = getColorName("#000"); // returns { exactMatch: true, name: 'Black', rgb: '#000000' }
const color01 = getColorName("#9399A7"); // returns { exactMatch: false, name: 'Manatee', rgb: '#9399A7' }

const color03 = getColorName("this is not a color"); // returns { exactMatch: false, name: 'not-a-color', rgb: null }
const color04 = getColorName(undefined); // returns { exactMatch: false, name: 'not-a-color', rgb: null }
```

## Credits

- Some code from [Farbtastic](http://www.acko.net/dev/farbtastic) by [Steven Wittens](http://www.acko.net/) was incorporated into the [ntc](https://chir.ag/projects/ntc/) js library.
- The [Resene RGB Values List](http://www-swiss.ai.mit.edu/~jaffer/Color/resenecolours.txt) is copyrighted to [Resene Paints Ltd](http://www.resene.co.nz/), 2001.
- The color names in this list were found via [Wikipedia](http://en.wikipedia.org/wiki/List_of_colors), [Crayola](http://en.wikipedia.org/wiki/List_of_Crayola_crayon_colors), and [Color-Name Dictionaries](http://www-swiss.ai.mit.edu/~jaffer/Color/Dictionaries.html).

## Licence

- The [ntc](https://chir.ag/projects/ntc/) js library is released under the [Creative Commons license](https://creativecommons.org/licenses/by/2.5/).
