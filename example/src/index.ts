import { getColorName, initColors, MINIMAL_COLORS } from "../../dist/ntc-ts.modern"

initColors(MINIMAL_COLORS);
const color = getColorName('#F89EAB');

console.log('color for #F89EAB', color)