import { parse } from '../src/modules/parser'
import { GotQL } from '../src/types/generics'
import { QueryType } from '../src/types/QueryType'
import ExecutionType = GotQL.ExecutionType
import { literal } from '../src'

describe('parser', () => {
  it('Should return a usable simple query', () => {
      const query = {
          operation: {
              name: 'TestOp',
              fields: ['field1', 'field2']
          }
      }
      const testReturn = 'query { TestOp { field1 field2 } }'
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should return a named simple query', () => {
      const query = {
          name: 'TestQuery',
          operation: {
              name: 'TestOp',
              fields: ['field1', 'field2']
          }
      }
      const testReturn = 'query TestQuery { TestOp { field1 field2 } }'
      const queryResult = parse(query, ExecutionType.QUERY)
      expect(queryResult).toEqual(testReturn)
  })

  it('Should return a named simple query with a variable', () => {
      const query = {
          name: 'TestQuery',
          variables: {
              name: {type: 'string!', value: 'Test'}
          },
          operation: {
              name: 'TestOp',
              fields: ['field1', 'field2']
          }
      }
      const testReturn = 'query TestQuery ($name: string!) { TestOp { field1 field2 } }'
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  describe('Should return a named simple query with a variable and arg variable', () => {
      const query = {
          name: 'TestQuery',
          variables: {
              name: {type: 'string!', value: 'Test'}
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
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should return an error when args has variable and variable is not declared', () => {
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

      expect(() => parse(query, ExecutionType.QUERY))
          .toThrowError(
              'Parse error: Failed to parse operation "TestOp" => Variable "name" is defined on operation but it has neither a type or a value'
          )
  })

  it('Should return an error when type is null', () => {
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

      // @ts-ignore
      expect(() => parse(query))
          .toThrowError(
              'Parse error: type must be either "query" or "mutation"'
          )
  })

  it('Should return an error when args has variable and variable is missing value', () => {
      const query = {
          name: 'TestQuery',
          variables: {
              name: {type: 'string!'}
          },
          operation: {
              name: 'TestOp',
              args: {
                  name: '$name'
              },
              fields: ['field1', 'field2']
          }
      }

      // @ts-ignore
      expect(() => parse(query, ExecutionType.QUERY))
          .toThrowError(
              'Parse error: Failed to parse operation "TestOp" => Variable "name" is defined on operation but it has neither a type or a value'
          )
  })

  it('Should return an error when args has variable and variable is missing type', () => {
      const query = {
          name: 'TestQuery',
          variables: {
              name: {value: 'string!'}
          },
          operation: {
              name: 'TestOp',
              args: {

                  name: '$name'
              },
              fields: ['field1', 'field2']
          }
      }

      // @ts-ignore
      expect(() => parse(query, ExecutionType.QUERY)).toThrowError(
          'Parse error: Failed to parse operation "TestOp" => Variable "name" is defined on operation but it has neither a type or a value'
      )

  })

  it('Should return an error when args has variable and variable is not present', () => {
      const query = {
          name: 'TestQuery',
          variables: {
              other: {value: 'string!'}
          },
          operation: {
              name: 'TestOp',
              args: {
                  name: '$name'
              },
              fields: ['field1', 'field2']
          }
      }

      // @ts-ignore
      expect(() => parse(query, ExecutionType.QUERY)).toThrowError(
          'Parse error: Failed to parse operation "TestOp" => Variable "name" is defined on operation but it has neither a type or a value'
      )
  })

  it('Should return an error when operation has no name', () => {
      const query = {
          name: 'TestQuery',
          operation: {
              fields: ['field1', 'field2']
          }
      }

      // @ts-ignore
      expect(() => parse(query, ExecutionType.QUERY)).toThrowError(
          'Parse error: name is required for graphQL operation'
      )
  })

  it('Should return an error when operation has no fields', () => {
      const query = {
          name: 'TestQuery',
          operation: {
              name: 'TestOp'
          }
      }

      // @ts-ignore
      expect(() => parse(query, ExecutionType.QUERY)).toThrowError(
          'Parse error: field list is required for operation "TestOp"'
      )
  })

  it('Should return an error when no operation exists', () => {
      const query = {
          name: 'TestQuery'
      }

      // @ts-ignore
      expect(() => parse(query, ExecutionType.QUERY)).toThrowError(
          'Parse error: a query must have at least one operation'
      )
  })

  it('Should return a simple operation with args', () => {
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
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should return a simple operation with boolean args', () => {
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
      // @ts-ignore
      const queryResult = parse(query, ExecutionType.QUERY)
      expect(queryResult).toEqual(testReturn)
  })

  it('Should return a simple operation with args not escaped', () => {
      const query = {
          operation: {
              name: 'TestOp',
              args: {
                  name: {value: 'Test', escape: false}
              },
              fields: ['field1', 'field2']
          }
      }
      const testReturn = 'query { TestOp(name: Test) { field1 field2 } }'
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should return a simple operation with args escaped', () => {
      const query = {
          operation: {
              name: 'TestOp',
              args: {
                  name: {value: 'Test', escape: true}
              },
              fields: ['field1', 'field2']
          }
      }
      const testReturn = 'query { TestOp(name: "Test") { field1 field2 } }'
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should return a simple operation with escaped arg variable as object but no errors', () => {
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
                  user: {value: '$test', escape: true}
              },
              fields: ['field1', 'field2']
          }
      }
      const testReturn = 'query ($test: string) { TestOp(user: "$test") { field1 field2 } }'
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should return a simple operation with arg variable as object but no errors', () => {
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
                  user: {value: '$test', escape: false}
              },
              fields: ['field1', 'field2']
          }
      }
      const testReturn = 'query ($test: string) { TestOp(user: $test) { field1 field2 } }'
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should return a simple operation with alias', () => {
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
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should parse fields recursively', () => {
      const query = {
          operation: {
              name: 'TestOp',
              args: {
                  name: 'Test'
              },
              fields: ['field1', 'field2', {owner: {fields: ['name', 'age']}}]
          }
      }
      const testReturn = 'query { TestOp(name: "Test") { field1 field2 owner { name age } } }'
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should parse fields recursively with empty objects', () => {
      const query = {
          operation: {
              name: 'TestOp',
              args: {
                  name: 'Test'
              },
              fields: ['field1', 'field2', {owner: {fields: ['name', 'age']}}, {people: {}}]
          }
      }
      const testReturn = 'query { TestOp(name: "Test") { field1 field2 owner { name age } people { } } }'
      // @ts-ignore
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should parse fields recursively with nested second level fields', () => {
      const query = {
          operation: {
              name: 'TestOp',
              args: {
                  name: 'Test'
              },
              fields: ['field1', 'field2', {owner: {fields: ['name', {people: {}}]}}]
          }
      }
      const testReturn = 'query { TestOp(name: "Test") { field1 field2 owner { name people { } } } }'
      // @ts-ignore
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should parse fields with args and variables (#16)', () => {
      const query = {
          operation: {
              name: 'TestOp',
              args: {
                  owner: '$owner'
              },
              fields: [
                  {
                      owner: {
                          args: {owner: '$owner'},
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
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should parse fields with args (#16)', () => {
      const query = {
          operation: {
              name: 'TestOp',
              fields: [
                  {
                      user: {
                          args: {user: 'user'}
                      }
                  }
              ]
          }
      }
      const testReturn = 'query { TestOp { user(user: "user") { } } }'
      // @ts-ignore
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should parse fields with no escaped args (#16)', () => {
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
      // @ts-ignore
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should parse complex nested fields with args (#16)', () => {
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
      // @ts-ignore
      const queryResult = parse(query, ExecutionType.QUERY)

      expect(queryResult).toEqual(testReturn)
  })

  it('Should allow for nested arguments in mutation or query operations (#28)', () => {
      const query = {
          operation: {
              name: 'updateSomething',
              args: {
                  id: '1234',
                  data: {
                      name: 'foo',
                      status: 'bar'
                  }
              },
              fields: ['test']
          }
      }

      const queryReturn = 'query { updateSomething(id: "1234", data: { name: "foo", status: "bar" }) { test } }'
      const queryResult = parse(query, ExecutionType.QUERY)
      expect(queryResult).toEqual(queryReturn)

      const mutationReturn = 'mutation { updateSomething(id: "1234", data: { name: "foo", status: "bar" }) { test } }'
      const mutationResult = parse(query, ExecutionType.MUTATION)
      expect(mutationResult).toEqual(mutationReturn)
  })

  it('Should allow numbers and other types in mutation args (#33)', () => {
      const query = {
          operation: {
              name: 'updateSomething',
              args: {
                  where: {id: {_eq: 0}},
                  _set: {name: 'test'}
              },
              fields: ['affected_rows']
          }
      }

      const queryReturn = 'query { updateSomething(where: { id: { _eq: "0" } }, _set: { name: "test" }) { affected_rows } }'
      // @ts-ignore
      const queryResult = parse(query, ExecutionType.QUERY)
      expect(queryResult).toEqual(queryReturn)

      const mutationReturn = 'mutation { updateSomething(where: { id: { _eq: "0" } }, _set: { name: "test" }) { affected_rows } }'
      // @ts-ignore
      const mutationResult = parse(query, 'mutation')
      expect(mutationResult).toEqual(mutationReturn)
  })

  it('Should allow null in mutation args (#33)', () => {
      const query = {
          operation: {
              name: 'updateSomething',
              args: {
                  where: {id: {_eq: 0}},
                  _set: {name: null}
              },
              fields: ['affected_rows']
          }
      }

      const queryReturn = 'query { updateSomething(where: { id: { _eq: "0" } }, _set: { name: null }) { affected_rows } }'
      // @ts-ignore
      const queryResult = parse(query, ExecutionType.QUERY)
      expect(queryResult).toEqual(queryReturn)

      const mutationReturn = 'mutation { updateSomething(where: { id: { _eq: "0" } }, _set: { name: null }) { affected_rows } }'
      // @ts-ignore
      const mutationResult = parse(query, 'mutation')
      expect(mutationResult).toEqual(mutationReturn)
  })

  it('Should pass on arrays as arrays (#35)', () => {
      const query = {
          operation: {
              name: 'insert_example',
              args: {
                  on_conflict: {update_columns: ['status', 'price']}
              },
              fields: ['affected_rows']
          }
      }

      const queryReturn = 'query { insert_example(on_conflict: { update_columns: ["status", "price"] }) { affected_rows } }'
      // @ts-ignore
      const queryResult = parse(query, ExecutionType.QUERY)
      expect(queryResult).toEqual(queryReturn)

      const mutationReturn = 'mutation { insert_example(on_conflict: { update_columns: ["status", "price"] }) { affected_rows } }'
      // @ts-ignore
      const mutationResult = parse(query, ExecutionType.MUTATION)
      expect(mutationResult).toEqual(mutationReturn)
  })

  it('Should throw an error on empty fields array in query (#36)', () => {
      const query = {
          operation: {
              name: 'updateSomething',
              args: {
                  where: {id: {_eq: 0}},
                  _set: {name: null}
              },
              fields: []
          }
      }

      expect(() => {
          // @ts-ignore
          parse(query, ExecutionType.QUERY)
      }).toThrowError(
          'Parse error: field list is required for operation "updateSomething"'
      )
  })

  it('Should return valid query string with empty fields array in mutation (#37)', () => {
      const query = {
          operation: {
              name: 'updateSomething',
              args: {
                  where: {id: {_eq: 0}},
                  _set: {name: null}
              },
              fields: []
          }
      }

      const mutationReturn = 'mutation { updateSomething(where: { id: { _eq: "0" } }, _set: { name: null }) }'
      // @ts-ignore
      const mutationResult = parse(query, ExecutionType.MUTATION)
      expect(mutationResult).toEqual(mutationReturn)
  })

  it('Should return valid query string with no fields array defined in mutation (#38)', () => {
      const query = {
          operation: {
              name: 'updateSomething',
              args: {
                  where: {id: {_eq: 0}},
                  _set: {name: null}
              }
          }
      }

      const mutationReturn = 'mutation { updateSomething(where: { id: { _eq: "0" } }, _set: { name: null }) }'
      // @ts-ignore
      const mutationResult = parse(query, ExecutionType.MUTATION)
      expect(mutationResult).toEqual(mutationReturn)
  })

  it('Should be able to parse objects nested in arrays (#53)', () => {
    const query: QueryType = {
      operation: {
        name: "Metadata",
        args: {
          where: {
            _and: [
              { hash: { _in: ["a", "b"] } },
              { pool: { _eq: 32 } }
            ],
          },
        },
        fields: ["key", "value"]
      }
    }

    const result = parse(query, ExecutionType.QUERY)
    const expectedResult = 'query { Metadata(where: { _and: [{ hash: { _in: ["a",  "b"] } },{ pool: { _eq: "32" } }] }) { key value } }'
    expect(result).toEqual(expectedResult)
  })

  it('should not add parenthesis if the args object is empty (#52)', () => {
    const query = {
        name: 'TestQuery',
        operation: {
            name: 'TestOp',
            args: {},
            fields: ['field1', 'field2']
        }
    }

    const testReturn = 'query TestQuery { TestOp { field1 field2 } }'
    const queryResult = parse(query, ExecutionType.QUERY)
    expect(queryResult).toEqual(testReturn)
  })

  it('should handle the empty object for variables (#52)', () => {
    const query = {
        name: 'TestQuery',
        operation: {
            name: 'TestOp',
            fields: ['field1', 'field2']
        },
        variables: {}
    }

    const testReturn = 'query TestQuery { TestOp { field1 field2 } }'
    const queryResult = parse(query, ExecutionType.QUERY)
    expect(queryResult).toEqual(testReturn)
  })

  it('should not treat undefined as falsy on variables when not using TS (#56)', () => {
    const query = {
      name: 'TestQuery',
      operation: {
        name: 'TestOp',
        fields: ['field1', 'field2']
      },
      variables: { testVar: { type: 'Boolean', value: false } }
    }

    const testReturn = 'query TestQuery ($testVar: Boolean) { TestOp { field1 field2 } }'
    const queryResult = parse((query as unknown) as QueryType, ExecutionType.QUERY)
    expect(queryResult).toEqual(testReturn)
  })

  it('Should enable working with array args that have more than one item', () => {
    const query = {
      operation: {
        name: 'productCreate',
        args: {
          media: [
            {
              originalSource:
                'https://example.com/image.jpg',
              mediaContentType: literal`IMAGE`,
            },
            {
              originalSource:
                'https://example.com/image_2.jpg',
              mediaContentType: literal`IMAGE`,
            },
          ],
        },
        fields: [
          {
            product: {
              fields: ['createdAt', 'title'],
            },
            userErrors: {
              fields: ['field', 'message'],
            },
          },
        ],
      },
    }

    const mutationResult = parse(query, ExecutionType.MUTATION)
    const expectedResult = 'mutation { productCreate(media: [{ originalSource: "https://example.com/image.jpg" , mediaContentType: IMAGE },{ originalSource: "https://example.com/image_2.jpg" , mediaContentType: IMAGE }]) { product { createdAt title } } }'
    expect(mutationResult).toEqual(expectedResult)
  })
})
