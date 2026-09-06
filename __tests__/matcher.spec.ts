import { describe, expect, it } from 'vitest'
import {
  createColorMatcher,
  getColorName,
  initColors,
  MINIMAL_COLORS
} from '../src'

describe('createColorMatcher', function () {
  it('isolates instance palettes and lookup caches', function () {
    const redMatcher = createColorMatcher([['FF0000', 'Instance Red']])
    const blueMatcher = createColorMatcher([['0000FF', 'Instance Blue']])

    const redResult = redMatcher.getColorName('#FE0000')
    expect(redMatcher.getColorName('#FE0000')).toBe(redResult)
    expect(blueMatcher.getColorName('#FE0000').name).toBe('Instance Blue')

    blueMatcher.flushCachedColors()
    expect(redMatcher.getColorName('#FE0000')).toBe(redResult)
  })

  it('accepts frozen readonly palettes without mutating them', function () {
    const palette = Object.freeze([
      Object.freeze(['abc', 'Readonly Color'] as const)
    ] as const)
    const matcher = createColorMatcher(palette)

    expect(matcher.getColorName('#AABBCC')).toEqual({
      exactMatch: true,
      name: 'Readonly Color',
      rgb: '#AABBCC'
    })
    expect(palette).toEqual([['abc', 'Readonly Color']])
  })

  it('can disable caching, including for exact matches', function () {
    const matcher = createColorMatcher([['FF0000', 'Red']], { cache: false })

    const first = matcher.getColorName('#FF0000')
    const second = matcher.getColorName('#FF0000')

    expect(second).toEqual(first)
    expect(second).not.toBe(first)
  })

  it('evicts the oldest lookup when maxCacheSize is reached', function () {
    const matcher = createColorMatcher([['000000', 'Black']], { maxCacheSize: 1 })
    const first = matcher.getColorName('#010101')

    expect(matcher.getColorName('#010101')).toBe(first)
    matcher.getColorName('#020202')
    expect(matcher.getColorName('#010101')).not.toBe(first)
  })

  it('uses FIFO insertion order without refreshing cache hits', function () {
    const matcher = createColorMatcher([['000000', 'Black']], { maxCacheSize: 2 })
    const first = matcher.getColorName('#010101')
    const second = matcher.getColorName('#020202')

    expect(matcher.getColorName('#010101')).toBe(first)
    matcher.getColorName('#030303')

    expect(matcher.getColorName('#020202')).toBe(second)
    expect(matcher.getColorName('#010101')).not.toBe(first)
  })

  it('treats maxCacheSize zero as no retained lookups', function () {
    const matcher = createColorMatcher([['000000', 'Black']], { maxCacheSize: 0 })
    const first = matcher.getColorName('#010101')

    expect(matcher.getColorName('#010101')).not.toBe(first)
  })

  it('rejects invalid cache bounds', function () {
    expect(() => createColorMatcher(undefined, { maxCacheSize: -1 })).toThrow(RangeError)
    expect(() => createColorMatcher(undefined, { maxCacheSize: 1.5 })).toThrow(RangeError)
  })

  it('uses the first duplicate exact hex', function () {
    const matcher = createColorMatcher([
      ['ABCDEF', 'First Exact'],
      ['abcdef', 'Second Exact']
    ], { cache: false })

    expect(matcher.getColorName('#ABCDEF').name).toBe('First Exact')
  })

  it('preserves palette order when nearest-match distances tie', function () {
    const matcher = createColorMatcher([
      ['000000', 'First Tie'],
      ['000000', 'Second Tie']
    ])

    expect(matcher.getColorName('#010101').name).toBe('First Tie')
  })

  it('returns not-a-color for invalid inputs', function () {
    const matcher = createColorMatcher([['FF0000', 'Red']])
    const notAColor = {
      exactMatch: false,
      name: 'not-a-color',
      rgb: null
    }

    expect(matcher.getColorName()).toEqual(notAColor)
    expect(matcher.getColorName('not a color')).toEqual(notAColor)
    expect(matcher.getColorName('#12')).toEqual(notAColor)
  })

  it('returns not-a-color for an empty palette', function () {
    const matcher = createColorMatcher([])

    expect(matcher.getColorName('#123456')).toEqual({
      exactMatch: false,
      name: 'not-a-color',
      rgb: null
    })
  })

  it('drops malformed palette entries', function () {
    const matcher = createColorMatcher([
      ['invalid', 'Invalid'],
      ['FF0000', 'Red']
    ])

    expect(matcher.getColorName('#FF0000').name).toBe('Red')
    expect(createColorMatcher([['invalid', 'Invalid']]).getColorName('#FF0000').name).toBe('not-a-color')
  })

  it('normalizes shorthand hex inputs', function () {
    const matcher = createColorMatcher([['FF0000', 'Red']])

    expect(matcher.getColorName('#f00')).toEqual({
      exactMatch: true,
      name: 'Red',
      rgb: '#FF0000'
    })
  })

  it('flushes the matcher cache when colors are re-initialized', function () {
    const matcher = createColorMatcher([['FF0000', 'First Red']])
    const cachedResult = matcher.getColorName('#FF0000')

    expect(matcher.getColorName('#FF0000')).toBe(cachedResult)
    matcher.initColors([['FF0000', 'Second Red']])
    expect(matcher.getColorName('#FF0000')).toEqual({
      exactMatch: true,
      name: 'Second Red',
      rgb: '#FF0000'
    })
    expect(matcher.getColorName('#FF0000')).not.toBe(cachedResult)
  })

  it('copies palettes during creation and re-initialization', function () {
    const initialPalette = [['FF0000', 'Initial Red']] as [string, string][]
    const nextPalette = [['0000FF', 'Next Blue']] as [string, string][]
    const matcher = createColorMatcher(initialPalette)

    initialPalette[0][1] = 'Mutated Red'
    expect(matcher.getColorName('#FF0000').name).toBe('Initial Red')

    matcher.initColors(nextPalette)
    nextPalette[0][1] = 'Mutated Blue'
    expect(matcher.getColorName('#0000FF').name).toBe('Next Blue')
  })

  it('does not change singleton state or behavior', function () {
    initColors(MINIMAL_COLORS)
    const singletonResult = getColorName('#9399A7')
    const matcher = createColorMatcher([['9399A7', 'Private Name']])

    expect(matcher.getColorName('#9399A7').name).toBe('Private Name')
    expect(getColorName('#9399A7')).toBe(singletonResult)
  })
})

describe('readonly palette types', function () {
  it('accepts as const palettes in all palette-taking APIs', function () {
    const palette = [['123456', 'Const Color']] as const

    initColors(palette)
    const matcher = createColorMatcher(palette)
    matcher.initColors(palette)

    expect(matcher.getColorName('#123456').name).toBe('Const Color')
  })
})
