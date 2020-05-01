import describe from 'ava'
import { parse } from '../dist/modules/parser'

describe('Should return a usable simple query', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      fields: ['field1', 'field2']
    }
  }
  const testReturn = 'query { TestOp { field1 field2 } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should return a named simple query', (assert) => {
  const query = {
    name: 'TestQuery',
    operation: {
      name: 'TestOp',
      fields: ['field1', 'field2']
    }
  }
  const testReturn = 'query TestQuery { TestOp { field1 field2 } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should return a named simple query with a variable', (assert) => {
  const query = {
    name: 'TestQuery',
    variables: {
      name: { type: 'string!', value: 'Test' }
    },
    operation: {
      name: 'TestOp',
      fields: ['field1', 'field2']
    }
  }
  const testReturn = 'query TestQuery ($name: string!) { TestOp { field1 field2 } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should return a named simple query with a variable and arg variable', (assert) => {
  const query = {
    name: 'TestQuery',
    variables: {
      name: { type: 'string!', value: 'Test' }
    },
    operation: {
      name: 'TestOp',
      args: {
        user: '$name'
      },
      fields: ['field1', 'field2']
    }
  }
  const testReturn = 'query TestQuery ($name: string!) { TestOp(user: $name) { field1 field2 } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should return an error when args has variable and variable is not declared', async (assert) => {
  const query = {
    name: 'TestQuery',
    operation: {
      name: 'TestOp',
      args: {
        name: '$name'
      },
      fields: ['field1', 'field2']
    }
  }

  try {
    parse(query, 'query')
  } catch (error) {
    assert.is(error.message, 'Parse error: Failed to parse operation "TestOp" => Variable "name" is defined on operation but it has neither a type or a value')
    assert.deepEqual(error.name, 'Error')
  }
})

describe('Should return an error when type is null', async (assert) => {
  const query = {
    name: 'TestQuery',
    operation: {
      name: 'TestOp',
      args: {
        name: '$name'
      },
      fields: ['field1', 'field2']
    }
  }

  try {
    parse(query)
  } catch (error) {
    assert.is(error.message, 'Parse error: type must be either "query" or "mutation"')
    assert.deepEqual(error.name, 'Error')
  }
})

describe('Should return an error when args has variable and variable is missing value', async (assert) => {
  const query = {
    name: 'TestQuery',
    variables: {
      name: { type: 'string!' }
    },
    operation: {
      name: 'TestOp',
      args: {
        name: '$name'
      },
      fields: ['field1', 'field2']
    }
  }

  try {
    parse(query, 'query')
  } catch (error) {
    assert.is(error.message, 'Parse error: Failed to parse operation "TestOp" => Variable "name" is defined on operation but it has neither a type or a value')
    assert.deepEqual(error.name, 'Error')
  }
})

describe('Should return an error when args has variable and variable is missing type', async (assert) => {
  const query = {
    name: 'TestQuery',
    variables: {
      name: { value: 'string!' }
    },
    operation: {
      name: 'TestOp',
      args: {
        name: '$name'
      },
      fields: ['field1', 'field2']
    }
  }

  try {
    parse(query, 'query')
  } catch (error) {
    assert.is(error.message, 'Parse error: Failed to parse operation "TestOp" => Variable "name" is defined on operation but it has neither a type or a value')
    assert.deepEqual(error.name, 'Error')
  }
})

describe('Should return an error when args has variable and variable is not present', async (assert) => {
  const query = {
    name: 'TestQuery',
    variables: {
      other: { value: 'string!' }
    },
    operation: {
      name: 'TestOp',
      args: {
        name: '$name'
      },
      fields: ['field1', 'field2']
    }
  }

  try {
    parse(query, 'query')
  } catch (error) {
    assert.is(error.message, 'Parse error: Failed to parse operation "TestOp" => Variable "name" is defined on operation but it has neither a type or a value')
    assert.deepEqual(error.name, 'Error')
  }
})

describe('Should return an error when operation has no name', async (assert) => {
  const query = {
    name: 'TestQuery',
    operation: {
      fields: ['field1', 'field2']
    }
  }

  try {
    parse(query, 'query')
  } catch (error) {
    assert.is(error.message, 'Parse error: name is required for graphQL operation')
    assert.deepEqual(error.name, 'Error')
  }
})

describe('Should return an error when operation has no fields', async (assert) => {
  const query = {
    name: 'TestQuery',
    operation: {
      name: 'TestOp'
    }
  }

  try {
    parse(query, 'query')
  } catch (error) {
    assert.is(error.message, 'Parse error: field list is required for operation "TestOp"')
    assert.deepEqual(error.name, 'Error')
  }
})

describe('Should return an error when no operation exists', async (assert) => {
  const query = {
    name: 'TestQuery'
  }

  try {
    parse(query, 'query')
  } catch (error) {
    assert.is(error.message, 'Parse error: a query must have at least one operation')
    assert.deepEqual(error.name, 'Error')
  }
})

describe('Should return a simple operation with args', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      args: {
        name: 'Test'
      },
      fields: ['field1', 'field2']
    }
  }
  const testReturn = 'query { TestOp(name: "Test") { field1 field2 } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should return a simple operation with boolean args', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      args: {
        aBooleanArg: true
      },
      fields: ['field1', 'field2']
    }
  }
  const testReturn = 'query { TestOp(aBooleanArg: true) { field1 field2 } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should return a simple operation with args not escaped', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      args: {
        name: { value: 'Test', escape: false }
      },
      fields: ['field1', 'field2']
    }
  }
  const testReturn = 'query { TestOp(name: Test) { field1 field2 } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should return a simple operation with args escaped', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      args: {
        name: { value: 'Test', escape: true }
      },
      fields: ['field1', 'field2']
    }
  }
  const testReturn = 'query { TestOp(name: "Test") { field1 field2 } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should return a simple operation with escaped arg variable as object but no errors', (assert) => {
  const query = {
    variables: {
      test: {
        type: 'string',
        value: 'TestVar'
      }
    },
    operation: {
      name: 'TestOp',
      args: {
        user: { value: '$test', escape: true }
      },
      fields: ['field1', 'field2']
    }
  }
  const testReturn = 'query ($test: string) { TestOp(user: "$test") { field1 field2 } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should return a simple operation with arg variable as object but no errors', (assert) => {
  const query = {
    variables: {
      test: {
        type: 'string',
        value: 'TestVar'
      }
    },
    operation: {
      name: 'TestOp',
      args: {
        user: { value: '$test', escape: false }
      },
      fields: ['field1', 'field2']
    }
  }
  const testReturn = 'query ($test: string) { TestOp(user: $test) { field1 field2 } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should return a simple operation with alias', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      alias: 'Alias',
      args: {
        name: 'Test'
      },
      fields: ['field1', 'field2']
    }
  }
  const testReturn = 'query { Alias: TestOp(name: "Test") { field1 field2 } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should parse fields recursively', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      args: {
        name: 'Test'
      },
      fields: ['field1', 'field2', { owner: { fields: ['name', 'age'] } }]
    }
  }
  const testReturn = 'query { TestOp(name: "Test") { field1 field2 owner { name age } } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should parse fields recursively with empty objects', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      args: {
        name: 'Test'
      },
      fields: ['field1', 'field2', { owner: { fields: ['name', 'age'] } }, { people: {} }]
    }
  }
  const testReturn = 'query { TestOp(name: "Test") { field1 field2 owner { name age } people { } } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should parse fields recursively with nested second level fields', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      args: {
        name: 'Test'
      },
      fields: ['field1', 'field2', { owner: { fields: ['name', { people: {} }] } }]
    }
  }
  const testReturn = 'query { TestOp(name: "Test") { field1 field2 owner { name people { } } } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should parse fields with args and variables (#16)', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      args: {
        owner: '$owner'
      },
      fields: [
        {
          owner: {
            args: { owner: '$owner' },
            fields: ['f1', 'f2']
          }
        }
      ]
    },
    variables: {
      owner: {
        type: 'String!',
        value: 'test'
      }
    }
  }
  const testReturn = 'query ($owner: String!) { TestOp(owner: $owner) { owner(owner: $owner) { f1 f2 } } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should parse fields with args (#16)', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      fields: [
        {
          user: {
            args: { user: 'user' }
          }
        }
      ]
    }
  }
  const testReturn = 'query { TestOp { user(user: "user") { } } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should parse fields with no escaped args (#16)', (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      fields: [
        {
          user: {
            args: {
              user: {
                value: 'user',
                escape: false
              }
            }
          }
        }
      ]
    }
  }
  const testReturn = 'query { TestOp { user(user: user) { } } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should parse complex nested fields with args (#16)', (assert) => {
  const query = {
    operation: {
      name: 'customer',
      args: {
        customerCode: '$customerCode',
        dataRepositoryCode: '$dataRepositoryCode',
        dataCollectionCode: 'dataCollectionCode',
        dataRecordIDs: '$dataRecordIDs',
        limit: '$limit'
      },
      fields: ['customerCode', {
        dataRepository: {
          args: {
            dataRepositoryCode: '$dataRepositoryCode'
          },
          fields: ['customerCode', 'dataRepositoryCode', 'metadata', {
            dataCollection: {
              args: {
                dataCollectionCode: '$dataCollectionCode'
              },
              fields: [{
                dataRecords: {
                  args: {
                    dataRecordIDs: '$dataRecordIDs',
                    limit: '$limit'
                  },
                  fields: [{
                    entities: {
                      fields: ['values', 'relatedDataRecords']
                    }
                  }]
                }
              }]
            }
          }]
        }
      }]
    },
    variables: {
      customerCode: {
        type: 'String!',
        value: 'test'
      },
      dataRepositoryCode: {
        type: 'String!',
        value: 'test'
      },
      dataCollectionCode: {
        type: 'String!',
        value: 'test'
      },
      dataRecordIDs: {
        type: '[String!]!',
        value: ['1', '2', '3']
      },
      limit: {
        type: 'Int',
        value: 500
      }
    }
  }

  const testReturn = 'query ($customerCode: String!, $dataRepositoryCode: String!, $dataCollectionCode: String!, $dataRecordIDs: [String!]!, $limit: Int) { customer(customerCode: $customerCode, dataRepositoryCode: $dataRepositoryCode, dataCollectionCode: "dataCollectionCode", dataRecordIDs: $dataRecordIDs, limit: $limit) { customerCode dataRepository(dataRepositoryCode: $dataRepositoryCode) { customerCode dataRepositoryCode metadata dataCollection(dataCollectionCode: $dataCollectionCode) { dataRecords(dataRecordIDs: $dataRecordIDs, limit: $limit) { entities { values relatedDataRecords } } } } } }'
  const queryResult = parse(query, 'query')

  assert.deepEqual(queryResult, testReturn)
})

describe('Should allow for nested arguments in mutation or query operations (#28)', (assert) => {
  const query = {
    operation: {
      name: 'updateSomething',
      args: {
        id: '1234',
        data: {
          name: 'foo',
          status: 'bar',
        },
      },
      fields: ['test'],
    },
  }

  const queryReturn = 'query { updateSomething(id: "1234", data: { name: "foo", status: "bar" }) { test } }'
  const queryResult = parse(query, 'query')
  assert.deepEqual(queryResult, queryReturn)

  const mutationReturn = 'mutation { updateSomething(id: "1234", data: { name: "foo", status: "bar" }) { test } }'
  const mutationResult = parse(query, 'mutation')
  assert.deepEqual(mutationResult, mutationReturn)
})

describe('Should allow numbers and other types in mutation args (#33)', (assert) => {
  const query = {
    operation: {
      name: 'updateSomething',
      args: {
        where: { id: { _eq: 0 } },
        _set: { name: 'test' },
      },
      fields: ['affected_rows'],
    },
  }

  const queryReturn = 'query { updateSomething(where: { id: { _eq: "0" } }, _set: { name: "test" }) { affected_rows } }'
  const queryResult = parse(query, 'query')
  assert.deepEqual(queryResult, queryReturn)

  const mutationReturn = 'mutation { updateSomething(where: { id: { _eq: "0" } }, _set: { name: "test" }) { affected_rows } }'
  const mutationResult = parse(query, 'mutation')
  assert.deepEqual(mutationResult, mutationReturn)
})

describe('Should allow null in mutation args (#33)', (assert) => {
  const query = {
    operation: {
      name: 'updateSomething',
      args: {
        where: { id: { _eq: 0 } },
        _set: { name: null },
      },
      fields: ['affected_rows'],
    },
  }

  const queryReturn = 'query { updateSomething(where: { id: { _eq: "0" } }, _set: { name: null }) { affected_rows } }'
  const queryResult = parse(query, 'query')
  assert.deepEqual(queryResult, queryReturn)

  const mutationReturn = 'mutation { updateSomething(where: { id: { _eq: "0" } }, _set: { name: null }) { affected_rows } }'
  const mutationResult = parse(query, 'mutation')
  assert.deepEqual(mutationResult, mutationReturn)
})
