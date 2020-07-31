import { run as runner } from '../src/modules/runner'
import { GotQL } from '../src/types/generics'
import got, { Got as GotInstance } from 'got'

declare type got = {
  post: Function
}

declare type Context = {
  endpointDns: string
  got?: {
    post: jest.Mock<any, any>,
  }
  gotWithErrors?: {
    post: jest.Mock<any, any>
  }
  endpointIp: string
}

declare type Test = {
  context: Context
}

const test: Test = {
  context: {
    endpointDns: '',
    endpointIp: ''
  }
}

const headers = {
  'X-Powered-By': 'GotQL - The serverside GraphQL query engine',
  'User-Agent': `GotQL ${require('../package.json').version}`,
  'Accept-Encoding': 'gzip, deflate',
  'Response-Type': 'application/json'
}

const parseToGotInstance = (gotInstance: got | undefined): GotInstance => gotInstance as GotInstance

describe('runner', () => {
  beforeEach(() => {
    test.context = {
      endpointDns: '',
      endpointIp: ''
    }
    test.context = {
      got: {
        post: jest.fn((endpoint: string) => (
          {
            body: JSON.stringify({
              data: 'Simple data'
            }),
            requestUrl: endpoint,
            statusCode: 200,
            statusMessage: 'OK'
          }
        ))
      },
      gotWithErrors: {
        post: jest.fn((endpoint: string) => Promise.reject({
          response: {
            body: 'internal error',
            url: endpoint
          },
          message: 'error'
        }))
      },
      endpointDns: 'my-local-dns.com',
      endpointIp: '192.168.0.1:4566'
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('Should successfully perform a simple query on DNS endpoint', async () => {
    const query = {
      operation: {
        name: 'TestOp',
        fields: ['t1', 't2']
      }
    }

    const payload = {
      headers,
      json: {
        query: 'query { TestOp { t1 t2 } }',
        operationName: null,
        variables: null
      }
    }

    const expectedResponse = {
      data: 'Simple data',
      endpoint: 'https://my-local-dns.com',
      statusCode: 200,
      message: 'OK'
    }

    const response = await runner(test.context.endpointDns, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.got))

    expect(test.context.got?.post).toBeCalledWith(expectedResponse.endpoint, payload)
    expect(response).toEqual(expectedResponse)
  })

  it('Should successfully perform a simple query on IP endpoint', async () => {
    const query = {
      operation: {
        name: 'TestOp',
        fields: ['t1', 't2']
      }
    }
    const payload = {
      headers,
      json: {
        query: 'query { TestOp { t1 t2 } }',
        operationName: null,
        variables: null
      }
    }

    const expectedResponse = {
      data: 'Simple data',
      endpoint: 'https://192.168.0.1:4566',
      statusCode: 200,
      message: 'OK'
    }

    const response = await runner(test.context.endpointIp, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.got))

    expect(test.context.got?.post).toBeCalledWith(expectedResponse.endpoint, payload)
    expect(response).toEqual(expectedResponse)
  })

  it('Should successfully handle a simple query errors on DNS endpoint', async () => {
    const query = {
      operation: {
        name: 'TestOp',
        fields: ['t1', 't2']
      }
    }
    const response = runner(test.context.endpointDns, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.gotWithErrors))

    await expect(() => response).rejects.toThrowError('Runner error: Error when executing query: error')
  })

  it('Should successfully handle a simple query errors on IP endpoint', async () => {
    const query = {
      operation: {
        name: 'TestOp',
        fields: ['t1', 't2']
      }
    }

    const response = runner(test.context.endpointIp, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.gotWithErrors))

    await expect(() => response).rejects.toThrowError('Runner error: Error when executing query: error')
  })

  it.todo('Should successfully handle a simple query errors with custom codes')

  it('Should successfully handle a simple query with custom headers', async () => {
    const query = {
      operation: {
        name: 'TestOp',
        fields: ['t1', 't2']
      }
    }
    const payload = {
      headers: {
        ...headers,
        'Test-Header': 't'
      },
      json: {
        query: 'query { TestOp { t1 t2 } }',
        operationName: null,
        variables: null
      }
    }

    const expectedResponse = {
      data: 'Simple data',
      endpoint: 'https://192.168.0.1:4566',
      statusCode: 200,
      message: 'OK'
    }

    const response = await runner(test.context.endpointIp, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.got), { headers: { 'Test-Header': 't' } })

    expect(test.context.got?.post).toBeCalledWith(expectedResponse.endpoint, payload)
    expect(response).toEqual(expectedResponse)
  })

  it('Should successfully handle a simple query with variables', async () => {
    const query = {
      variables: {
        testVar: {
          type: 'string',
          value: 't'
        }
      },
      operation: {
        name: 'TestOp',
        fields: ['t1', 't2']
      }
    }
    const payload = {
      headers,
      json: {
        query: 'query ($testVar: string) { TestOp { t1 t2 } }',
        operationName: null,
        variables: { testVar: 't' }
      }
    }

    const expectedResponse = {
      data: 'Simple data',
      endpoint: 'https://192.168.0.1:4566',
      statusCode: 200,
      message: 'OK'
    }

    const response = await runner(test.context.endpointIp, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.got))

    expect(test.context.got?.post).toBeCalledWith(expectedResponse.endpoint, payload)
    expect(response).toEqual(expectedResponse)
  })
})
