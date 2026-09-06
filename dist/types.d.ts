export type COLOR = [
    hex: string,
    name: string,
    red?: number,
    green?: number,
    blue?: number,
    hue?: number,
    saturation?: number,
    lightness?: number
];
export interface FORMATTED_COLOR {
    exactMatch: boolean;
    name: string;
    rgb: string | null;
}
export interface CACHED_COLOR {
    [key: string]: FORMATTED_COLOR;
}
export interface COLOR_MATCHER_OPTIONS {
    cache?: boolean;
    maxCacheSize?: number;
}
export interface COLOR_MATCHER {
    getColorName: (color?: string) => FORMATTED_COLOR;
    initColors: (colors: ReadonlyArray<Readonly<COLOR>>) => void;
    flushCachedColors: () => void;
}
