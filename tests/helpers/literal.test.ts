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

  it('should return an error when the argument is empty', () => {
    expect(() => literal``).toThrowError('literalValue cannot be null or empty')
  })

  it('should return an error when the argument is null', () => {
    const nullValue = null as unknown as TemplateStringsArray
    expect(() => literal(nullValue)).toThrowError('literalValue cannot be null or empty')
  })
})
