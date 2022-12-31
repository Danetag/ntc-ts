import { CACHED_COLOR, COLOR, FORMATTED_COLOR } from './types';
export declare let cachedColors: CACHED_COLOR;
export declare let colors: COLOR[];
export declare const NOT_A_COLOR = "not-a-color";
export declare function initColors(_colors: COLOR[]): void;
export declare function flushCachedColors(): void;
export declare function getColorName(color?: string): FORMATTED_COLOR;
