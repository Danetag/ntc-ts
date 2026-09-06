import { CACHED_COLOR, COLOR, COLOR_MATCHER, COLOR_MATCHER_OPTIONS, FORMATTED_COLOR } from './types.js';
export declare let cachedColors: CACHED_COLOR;
export declare let colors: COLOR[];
export declare const NOT_A_COLOR = "not-a-color";
export declare function initColors(_colors: ReadonlyArray<Readonly<COLOR>>): void;
export declare function flushCachedColors(): void;
export declare function getColorName(color?: string): FORMATTED_COLOR;
export declare function createColorMatcher(palette?: ReadonlyArray<Readonly<COLOR>>, options?: COLOR_MATCHER_OPTIONS): COLOR_MATCHER;
