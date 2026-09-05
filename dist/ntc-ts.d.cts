type COLOR = [
    hex: string,
    name: string,
    red?: number,
    green?: number,
    blue?: number,
    hue?: number,
    saturation?: number,
    lightness?: number
];
interface FORMATTED_COLOR {
    exactMatch: boolean;
    name: string;
    rgb: string | null;
}
interface CACHED_COLOR {
    [key: string]: FORMATTED_COLOR;
}

declare let cachedColors: CACHED_COLOR;
declare let colors: COLOR[];
declare const NOT_A_COLOR = "not-a-color";
declare function initColors(_colors: COLOR[]): void;
declare function flushCachedColors(): void;
declare function getColorName(color?: string): FORMATTED_COLOR;

declare const MINIMAL_COLORS: COLOR[];

declare const ORIGINAL_COLORS: COLOR[];

export { type CACHED_COLOR, type COLOR, type FORMATTED_COLOR, MINIMAL_COLORS, NOT_A_COLOR, ORIGINAL_COLORS, cachedColors, colors, flushCachedColors, getColorName, initColors };
