import {
  CACHED_COLOR,
  COLOR,
  COLOR_MATCHER,
  COLOR_MATCHER_OPTIONS,
  FORMATTED_COLOR
} from './types'

export let cachedColors: CACHED_COLOR = {}
export let colors: COLOR[] = [['000000', 'Black']]

export const NOT_A_COLOR = 'not-a-color'

type POPULATED_COLOR = [
  hex: string,
  name: string,
  red: number,
  green: number,
  blue: number,
  hue: number,
  saturation: number,
  lightness: number
]

function normalizeHexColor (color: string): string | null {
  const hex = color.startsWith('#') ? color.slice(1) : color

  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
    return null
  }

  if (hex.length === 3) {
    return hex.split('').map(character => character.repeat(2)).join('').toUpperCase()
  }

  return hex.toUpperCase()
}

function isPopulatedColor (color: COLOR): color is POPULATED_COLOR {
  return color.length >= 8 && color.slice(2, 8).every(value => (
    typeof value === 'number' && Number.isFinite(value)
  ))
}

function getRGB (color: string, divider = 1): number[] {
  return [
    parseInt(color.slice(1, 3), 16) / divider,
    parseInt(color.slice(3, 5), 16) / divider,
    parseInt(color.slice(5, 7), 16) / divider
  ]
}

function getHSL (color: string): number[] {
  const rgb = getRGB(color, 255)

  const r = rgb[0]
  const g = rgb[1]
  const b = rgb[2]

  const min = Math.min(r, Math.min(g, b))
  const max = Math.max(r, Math.max(g, b))
  const delta = max - min

  let h = 0
  let s = 0
  const l = (min + max) / 2

  if (l > 0 && l < 1) {
    s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l))
  }

  if (delta > 0) {
    if (max === r && max !== g) h += (g - b) / delta
    if (max === g && max !== b) h += (2 + (b - r) / delta)
    if (max === b && max !== r) h += (4 + (r - g) / delta)
    h /= 6
  }

  return [Math.round(h * 255), Math.round(s * 255), Math.round(l * 255)]
}

function populateColor (color: COLOR): POPULATED_COLOR {
  if (isPopulatedColor(color)) return color

  const hexColor = `#${color[0]}`
  const [red, green, blue] = getRGB(hexColor)
  const [hue, saturation, lightness] = getHSL(hexColor)

  return [
    color[0],
    color[1],
    red,
    green,
    blue,
    hue,
    saturation,
    lightness
  ]
}

function formatColor (rgb: string | null, colorName: string, exactMatch = false): FORMATTED_COLOR {
  return {
    exactMatch,
    name: colorName,
    rgb
  }
}

function clonePalette (_colors: ReadonlyArray<Readonly<COLOR>>): COLOR[] {
  return _colors.flatMap((color): COLOR[] => {
    const normalizedHex = normalizeHexColor(color[0])

    // Preserve the permissive API while ensuring malformed entries cannot
    // introduce NaN values into color-distance calculations.
    if (normalizedHex === null) return []

    const normalizedColor = [...color] as COLOR
    normalizedColor[0] = normalizedHex
    return [normalizedColor]
  })
}

export function initColors (_colors: ReadonlyArray<Readonly<COLOR>>): void {
  colors = clonePalette(_colors)
  flushCachedColors()
}

export function flushCachedColors (): void {
  cachedColors = {}
}

export function getColorName (color?: string): FORMATTED_COLOR {
  if (typeof color !== 'string') {
    return formatColor(null, NOT_A_COLOR, false)
  }

  const normalizedColor = normalizeHexColor(color)
  if (normalizedColor === null) {
    return formatColor(null, NOT_A_COLOR, false)
  }

  color = `#${normalizedColor}`

  // See if color has been found yet
  if (typeof cachedColors[color] !== 'undefined') {
    return cachedColors[color]
  }

  const rgb = getRGB(color)
  const r = rgb[0]
  const g = rgb[1]
  const b = rgb[2]

  const hsl = getHSL(color)
  const h = hsl[0]
  const s = hsl[1]
  const l = hsl[2]

  let cl = -1
  let df = -1

  // Find in names
  for (let i = 0; i < colors.length; i++) {
    const currentColor = colors[i]
    const currentHexColor = `#${currentColor[0]}`
    const currentNameColor = String(currentColor[1])

    // Add RGB/HSL if missing and persist it in the internal palette copy.
    const populatedColor = populateColor(currentColor)
    if (populatedColor !== currentColor) colors[i] = populatedColor

    // Exact match
    if (color === currentHexColor) {
      // add to cached color
      cachedColors[color] = formatColor(currentHexColor, currentNameColor, true)
      return cachedColors[color]
    }

    const [, , cR, cG, cB, cH, cS, cL] = populatedColor

    const ndf1 = Math.pow(r - cR, 2) + Math.pow(g - cG, 2) + Math.pow(b - cB, 2)
    const ndf2 = Math.pow(h - cH, 2) + Math.pow(s - cS, 2) + Math.pow(l - cL, 2)

    const ndf = ndf1 + ndf2 * 2

    if (df < 0 || df > ndf) {
      df = ndf
      cl = i
    }
  }

  // Not found
  if (cl < 0) {
    return formatColor(null, NOT_A_COLOR, false)
  }

  const currentColor = colors[cl]
  const currentHexColor = `#${currentColor[0]}`
  const currentNameColor = String(currentColor[1])

  // add to cached color
  cachedColors[color] = formatColor(currentHexColor, currentNameColor, false)

  return cachedColors[color]
}

type COMPILED_PALETTE = {
  colors: COLOR[]
  exactIndexes: Map<string, number>
}

function compilePalette (_colors: ReadonlyArray<Readonly<COLOR>>): COMPILED_PALETTE {
  const compiledColors = clonePalette(_colors)
  const exactIndexes = new Map<string, number>()

  compiledColors.forEach((color, index) => {
    const hex = color[0]
    if (!exactIndexes.has(hex)) exactIndexes.set(hex, index)
  })

  return { colors: compiledColors, exactIndexes }
}

export function createColorMatcher (
  palette: ReadonlyArray<Readonly<COLOR>> = [['000000', 'Black']],
  options: COLOR_MATCHER_OPTIONS = {}
): COLOR_MATCHER {
  const cacheEnabled = options.cache ?? true
  const maxCacheSize = options.maxCacheSize

  if (maxCacheSize !== undefined && (!Number.isInteger(maxCacheSize) || maxCacheSize < 0)) {
    throw new RangeError('maxCacheSize must be a non-negative integer')
  }

  let compiledPalette = compilePalette(palette)
  let lookupCache = new Map<string, FORMATTED_COLOR>()

  function flushMatcherCache (): void {
    lookupCache = new Map()
  }

  function cacheResult (hex: string, result: FORMATTED_COLOR): FORMATTED_COLOR {
    if (!cacheEnabled || maxCacheSize === 0) return result

    if (maxCacheSize !== undefined && lookupCache.size >= maxCacheSize) {
      const oldestKey = lookupCache.keys().next().value as string
      lookupCache.delete(oldestKey)
    }

    lookupCache.set(hex, result)
    return result
  }

  function initMatcherColors (_colors: ReadonlyArray<Readonly<COLOR>>): void {
    compiledPalette = compilePalette(_colors)
    flushMatcherCache()
  }

  function getMatcherColorName (input?: string): FORMATTED_COLOR {
    if (typeof input !== 'string') return formatColor(null, NOT_A_COLOR, false)

    const normalizedColor = normalizeHexColor(input)
    if (normalizedColor === null) return formatColor(null, NOT_A_COLOR, false)

    const hex = `#${normalizedColor}`
    const cachedColor = lookupCache.get(hex)
    if (cachedColor !== undefined) return cachedColor

    const exactIndex = compiledPalette.exactIndexes.get(normalizedColor)
    if (exactIndex !== undefined) {
      const exactColor = compiledPalette.colors[exactIndex]
      return cacheResult(hex, formatColor(`#${exactColor[0]}`, String(exactColor[1]), true))
    }

    const [red, green, blue] = getRGB(hex)
    const [hue, saturation, lightness] = getHSL(hex)
    let closestIndex = -1
    let closestDifference = -1

    for (let index = 0; index < compiledPalette.colors.length; index++) {
      const currentColor = compiledPalette.colors[index]
      const populatedColor = populateColor(currentColor)
      if (populatedColor !== currentColor) compiledPalette.colors[index] = populatedColor

      const [, , currentRed, currentGreen, currentBlue, currentHue, currentSaturation, currentLightness] = populatedColor
      const rgbDifference = Math.pow(red - currentRed, 2) + Math.pow(green - currentGreen, 2) + Math.pow(blue - currentBlue, 2)
      const hslDifference = Math.pow(hue - currentHue, 2) + Math.pow(saturation - currentSaturation, 2) + Math.pow(lightness - currentLightness, 2)
      const difference = rgbDifference + hslDifference * 2

      if (closestDifference < 0 || closestDifference > difference) {
        closestDifference = difference
        closestIndex = index
      }
    }

    if (closestIndex < 0) return formatColor(null, NOT_A_COLOR, false)

    const closestColor = compiledPalette.colors[closestIndex]
    return cacheResult(hex, formatColor(`#${closestColor[0]}`, String(closestColor[1]), false))
  }

  return {
    getColorName: getMatcherColorName,
    initColors: initMatcherColors,
    flushCachedColors: flushMatcherCache
  }
}
