import { fragment } from '../../src/helpers/fragment'

describe('literal', () => {
  it('Should return an object with value and escape properties', () => {
    const expectedResult = '...test'
    const fragmentResult = fragment`test`
    expect(fragmentResult).toEqual(expectedResult)
  })

  it('Should error when fragment name is empty', () => {
    try {
      fragment``
    } catch (err: unknown) {
      expect(err instanceof Error).toBe(true)
      expect((err as Error).message).toEqual('Fragment name cannot be empty')
    }
  })
})
