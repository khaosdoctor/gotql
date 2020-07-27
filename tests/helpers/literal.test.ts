import { literal } from '../../src/helpers/literal'
import { LiteralObject } from '../../src/types/Literal'

describe('literal', () => {
  it('Should return an object with value and escape properties', () => {
    const expectedResult: LiteralObject = { value: 'field_test', escape: false }

    const literalResult = literal`field_test`

    expect(literalResult).toEqual(expectedResult)
  })

  it('Should return an object with value and escape properties, keeping the array informed in the literal', () => {
    const expectedResult: LiteralObject = { value: "['field01','field01']", escape: false }

    const literalResult = literal`['field01','field01']`

    expect(literalResult).toEqual(expectedResult)
  })

  it('should return an object with an empty value property, when literal is called with empty arguments', () => {
    const expectedResult: LiteralObject = { value: '', escape: false }

    const literalResult = literal``

    expect(literalResult).toEqual(expectedResult)
  })

  it('should return an object with an empty value property, when the literal is called with a null argument', () => {
    const expectedResult: LiteralObject = { value: '', escape: false }

    const nullValue = null as unknown as TemplateStringsArray

    const literalResult = literal(nullValue)

    expect(literalResult).toEqual(expectedResult)
  })
})
