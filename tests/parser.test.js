import describe from 'ava'
import parser from '../src/modules/parser'

describe('Should return a usable simple query', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      fields: [ 'field1', 'field2' ]
    }
  }
  const testReturn = 'query { TestOp { field1 field2 } }'
  const queryResult = parser.parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})
