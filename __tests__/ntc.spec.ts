import { getColorName, NOT_A_COLOR } from '../src'

describe('ntc', function () {
  it('returns "Burnham" for #002E20 (exact match)', function () {
    const color = getColorName('#002E20')

    expect(color.name).toEqual('Burnham')
    expect(color.exactMatch).toEqual(true)
  })

  it('returns "Manatee" for #9399A7 (closest match)', function () {
    const color = getColorName('#9399A7')

    expect(color.name).toEqual('Manatee')
    expect(color.exactMatch).toEqual(false)
  })

  it('returns name=\'no-a-color\' and rgb=null when it\'s not a color', function () {
    const color = getColorName('not a color')

    expect(color.name).toEqual(NOT_A_COLOR)
    expect(color.rgb).toEqual(null)
  })
})
