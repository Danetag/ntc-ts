import { colors, getColorName, initColors, NOT_A_COLOR } from '../src'
import { MINIMAL_COLORS } from '../src/colors/minimal'
import { ORIGINAL_COLORS } from '../src/colors/original'

describe('ntc', function () {
  it('returns "Black" when not initialize with a color set', function () {
    const color = getColorName('#FF0001')

    expect(colors.length).toEqual(1)
    expect(color.name).toEqual('Black')
    expect(color.exactMatch).toEqual(false)
  })

  it('inits with minimal colors and find red', function () {
    initColors(MINIMAL_COLORS)
    const color = getColorName('#FF0001')

    expect(colors.length).toEqual(MINIMAL_COLORS.length)
    expect(color.name).toEqual('Red')
    expect(color.exactMatch).toEqual(false)
  })

  it('returns "Burnham" for #002E20 (exact match)', function () {
    initColors(ORIGINAL_COLORS)
    const color = getColorName('#002E20')

    expect(colors.length).toEqual(ORIGINAL_COLORS.length)
    expect(color.name).toEqual('Burnham')
    expect(color.exactMatch).toEqual(true)
  })

  it('returns "Manatee" for #9399A7 (closest match)', function () {
    initColors(ORIGINAL_COLORS)
    const color = getColorName('#9399A7')

    expect(color.name).toEqual('Manatee')
    expect(color.exactMatch).toEqual(false)
  })

  it('returns name=\'no-a-color\' and rgb=null when it\'s not a color', function () {
    initColors(ORIGINAL_COLORS)
    const color = getColorName('not a color')

    expect(color.name).toEqual(NOT_A_COLOR)
    expect(color.rgb).toEqual(null)
  })
})
