import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cachedColors,
  colors,
  flushCachedColors,
  getColorName,
  initColors,
  MINIMAL_COLORS,
  NOT_A_COLOR,
  ORIGINAL_COLORS
} from '../src'
import type { COLOR } from '../src'

const invalidColor = {
  exactMatch: false,
  name: NOT_A_COLOR,
  rgb: null
}

const builtInPalettes = [
  ['MINIMAL_COLORS', MINIMAL_COLORS],
  ['ORIGINAL_COLORS', ORIGINAL_COLORS]
] as const

describe('built-in palettes', function () {
  it.each(builtInPalettes)('%s contains unique, normalized six-digit hex values', function (_name, palette) {
    const hexValues = palette.map(([hex]) => hex)

    expect(hexValues.every(hex => /^[0-9A-F]{6}$/.test(hex))).toBe(true)
    expect(new Set(hexValues).size).toBe(hexValues.length)
  })

  it.each(builtInPalettes)('%s returns every entry as an exact lookup', function (_name, palette) {
    initColors(palette)

    for (const [hex, name] of palette) {
      expect(getColorName(hex)).toEqual({
        exactMatch: true,
        name,
        rgb: `#${hex}`
      })
    }
  })
})

describe('ntc', function () {
  beforeEach(function () {
    initColors(MINIMAL_COLORS)
  })

  it('uses the default Black palette before initialization', async function () {
    vi.resetModules()
    const freshNtc = await import('../src')

    expect(freshNtc.colors).toEqual([['000000', 'Black']])
    expect(freshNtc.getColorName('#010101')).toEqual({
      exactMatch: false,
      name: 'Black',
      rgb: '#000000'
    })
  })

  it('finds a shorthand hex color', function () {
    expect(getColorName('#f00')).toEqual({
      exactMatch: true,
      name: 'Red',
      rgb: '#FF0000'
    })
  })

  it('normalizes shorthand custom palette entries', function () {
    initColors([['F00', 'Custom Red']])

    expect(colors).toEqual([['FF0000', 'Custom Red']])
    expect(getColorName('#FF0000')).toEqual({
      exactMatch: true,
      name: 'Custom Red',
      rgb: '#FF0000'
    })
  })

  it('drops malformed custom palette entries without throwing', function () {
    initColors([
      ['not-hex', 'Invalid'],
      ['#0f0', 'Valid Green']
    ])

    expect(colors).toEqual([['00FF00', 'Valid Green']])
    expect(getColorName('#00FF00').name).toBe('Valid Green')
  })

  it('returns NOT_A_COLOR when the palette is empty', function () {
    initColors([])

    expect(getColorName('#123456')).toEqual(invalidColor)
  })

  it('accepts a hex color without #', function () {
    expect(getColorName('00FF00')).toEqual({
      exactMatch: true,
      name: 'Green',
      rgb: '#00FF00'
    })
  })

  it('matches colors case-insensitively', function () {
    expect(getColorName('#ff0000')).toEqual({
      exactMatch: true,
      name: 'Red',
      rgb: '#FF0000'
    })
  })

  it.each([
    ['invalid hex letters', '#GG0000'],
    ['too few digits', '#12'],
    ['too many digits', '#1234567'],
    ['unsupported four-digit form', '#1234'],
    ['empty input', '']
  ])('rejects %s', function (_description, input) {
    expect(getColorName(input)).toEqual(invalidColor)
  })

  it('rejects a missing color', function () {
    expect(getColorName()).toEqual(invalidColor)
  })

  it('finds exact and closest matches in the original palette', function () {
    initColors(ORIGINAL_COLORS)

    expect(getColorName('#002E20')).toEqual({
      exactMatch: true,
      name: 'Burnham',
      rgb: '#002E20'
    })
    expect(getColorName('#9399A7')).toEqual({
      exactMatch: false,
      name: 'Manatee',
      rgb: '#8D90A1'
    })
  })

  it('persists lazy palette values and flushes only lookup results', function () {
    expect(colors[0]).toHaveLength(2)

    const result = getColorName('#010101')

    expect(colors[0]).toHaveLength(8)
    expect(colors[0].slice(2)).toEqual([0, 0, 0, 0, 0, 0])
    expect(cachedColors['#010101']).toBe(result)
    expect(getColorName('#010101')).toBe(result)

    flushCachedColors()

    expect(cachedColors).toEqual({})
    expect(colors[0]).toHaveLength(8)
  })

  it('does not mutate the caller palette while populating lazy values', function () {
    const palette: COLOR[] = [['010203', 'Almost Black']]
    const originalPalette = palette.map(color => [...color])

    initColors(palette)
    getColorName('#010204')

    expect(palette).toEqual(originalPalette)
    expect(colors[0]).toHaveLength(8)
    expect(colors[0]).not.toBe(palette[0])
  })

  it('isolates lookup and lazy caches when re-initialized', function () {
    const firstPalette: COLOR[] = [['FF0000', 'First Red']]
    const secondPalette: COLOR[] = [['0000FF', 'Second Blue']]

    initColors(firstPalette)
    getColorName('#FE0000')
    expect(cachedColors['#FE0000']).toBeDefined()
    expect(colors[0]).toHaveLength(8)

    initColors(secondPalette)

    expect(cachedColors).toEqual({})
    expect(colors[0]).toEqual(['0000FF', 'Second Blue'])
    expect(getColorName('#0000FF').name).toBe('Second Blue')
  })

  it('accepts palettes that already contain cached numeric fields', function () {
    const palette: COLOR[] = [
      ['000000', 'Black', 0, 0, 0, 0, 0, 0]
    ]

    initColors(palette)

    expect(getColorName('#000001').name).toBe('Black')
    expect(colors[0]).toEqual(palette[0])
    expect(colors[0]).not.toBe(palette[0])
  })

  it('recomputes incomplete or non-finite cached numeric fields', function () {
    const palette: COLOR[] = [
      ['010203', 'Almost Black', Number.NaN, 2, 3, 4, 5, 6]
    ]

    initColors(palette)
    expect(getColorName('#010204').name).toBe('Almost Black')
    expect(colors[0].slice(2).every(value => Number.isFinite(value))).toBe(true)
  })
})
