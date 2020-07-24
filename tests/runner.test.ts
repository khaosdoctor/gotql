import prependHttp from 'prepend-http'
import { run as runner } from '../src/modules/runner'
import { GotQL } from "../src/types/generics"
import { GotUrl, GotOptions, GotInstance } from 'got'

declare type got = {
  post: Function
}

declare type Context = {
  endpointDns: string;
  got?: got;
  gotWithErrors?: got;
  endpointIp: string;
}

declare type Test = {
  context: Context;
};

const test: Test = {
  context: {
    endpointDns: "",
    endpointIp: ""
  }
};

const parseToGotInstance = (gotInstance: got | undefined): GotInstance => gotInstance as GotInstance;

beforeEach(() => {
  test.context = {
    endpointDns: "",
    endpointIp: ""
  };
  test.context = {
    got: {
      post: (endpoint: GotUrl, options: GotOptions<string | null>) => {
        return new Promise((resolve) => {
          const ret = {
            body: {
              data: 'Simple data',
              endpoint,
              options
            }
          }
          resolve(ret)
        })
      }
    },
    gotWithErrors: {
      post: (endpoint: GotUrl, options: GotOptions<string | null>) => {
        return new Promise((resolve) => {
          const ret = {
            body: {
              errors: 'Simple data',
              endpoint,
              options
            }
          }
          resolve(ret)
        })
      }
    },
    endpointDns: 'my-local-dns.com',
    endpointIp: '192.168.0.1:4566'
  }
})

// --- //


describe('runner', () => {
  it('Should successfully perform a simple query on DNS endpoint', async () => {
    const query = {
      operation: {
        name: 'TestOp',
        fields: ['t1', 't2']
      }
    }
    const payload = {
      headers: {
        'X-Powered-By': 'GotQL - The serverside GraphQL query engine',
        'User-Agent': `GotQL ${require('../package.json').version}`,
        'Accept-Encoding': 'gzip, deflate'
      },
      body: {
        query: 'query { TestOp { t1 t2 } }',
        operationName: null,
        variables: null
      },
      json: true
    }
    const response = await runner(test.context.endpointDns, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.got))

    expect(prependHttp(test.context.endpointDns)).toEqual(response.endpoint);

    expect(payload).toEqual(response.options)
  })
  
  it('Should successfully perform a simple query on IP endpoint', async () => {
    const query = {
      operation: {
        name: 'TestOp',
        fields: ['t1', 't2']
      }
    }
    const payload = {
      headers: {
        'X-Powered-By': 'GotQL - The serverside GraphQL query engine',
        'User-Agent': `GotQL ${require('../package.json').version}`,
        'Accept-Encoding': 'gzip, deflate'
      },
      body: {
        query: 'query { TestOp { t1 t2 } }',
        operationName: null,
        variables: null
      },
      json: true
    }
    const response = await runner(test.context.endpointIp, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.got))
  
    expect(prependHttp(test.context.endpointIp)).toEqual(response.endpoint)

    expect(payload).toEqual(response.options)
  })

  it('Should successfully handle a simple query errors on DNS endpoint', async () => {
    const query = {
      operation: {
        name: 'TestOp',
        fields: ['t1', 't2']
      }
    }
    const payload = {
      headers: {
        'X-Powered-By': 'GotQL - The serverside GraphQL query engine',
        'User-Agent': `GotQL ${require('../package.json').version}`,
        'Accept-Encoding': 'gzip, deflate'
      },
      body: {
        query: 'query { TestOp { t1 t2 } }',
        operationName: null,
        variables: null
      },
      json: true
    }
    const response = await runner(test.context.endpointDns, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.gotWithErrors))
  
    expect(prependHttp(test.context.endpointDns)).toEqual(response.endpoint)
    expect(payload).toEqual(response.options)
    expect(500).toEqual(response.statusCode)
    expect('GraphQL Error').toEqual(response.message)
  })

  it('Should successfully handle a simple query errors on IP endpoint', async () => {
    const query = {
      operation: {
        name: 'TestOp',
        fields: ['t1', 't2']
      }
    }
    const payload = {
      headers: {
        'X-Powered-By': 'GotQL - The serverside GraphQL query engine',
        'User-Agent': `GotQL ${require('../package.json').version}`,
        'Accept-Encoding': 'gzip, deflate'
      },
      body: {
        query: 'query { TestOp { t1 t2 } }',
        operationName: null,
        variables: null
      },
      json: true
    }
    const response = await runner(test.context.endpointIp, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.gotWithErrors))
  
    expect(prependHttp(test.context.endpointIp)).toEqual(response.endpoint)
    expect(payload).toEqual(response.options)
    expect(500).toEqual(response.statusCode)
    expect('GraphQL Error').toEqual(response.message)
  })

  it('Should successfully handle a simple query errors with custom codes', async () => {
    const query = {
      operation: {
        name: 'TestOp',
        fields: ['t1', 't2']
      }
    }
    const payload = {
      headers: {
        'X-Powered-By': 'GotQL - The serverside GraphQL query engine',
        'User-Agent': `GotQL ${require('../package.json').version}`,
        'Accept-Encoding': 'gzip, deflate'
      },
      body: {
        query: 'query { TestOp { t1 t2 } }',
        operationName: null,
        variables: null
      },
      json: true
    }
    const errorStatusCode = 399
    const response = await runner(test.context.endpointIp, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.gotWithErrors), { errorStatusCode })
  
    expect(prependHttp(test.context.endpointIp)).toEqual(response.endpoint)
    expect(payload).toEqual(response.options)
    expect(errorStatusCode).toEqual(response.statusCode)
    expect('GraphQL Error').toEqual(response.message)
  })

  it('Should successfully handle a simple query with custom headers', async () => {
    const query = {
      operation: {
        name: 'TestOp',
        fields: ['t1', 't2']
      }
    }
    const payload = {
      headers: {
        'X-Powered-By': 'GotQL - The serverside GraphQL query engine',
        'User-Agent': `GotQL ${require('../package.json').version}`,
        'Accept-Encoding': 'gzip, deflate',
        'Test-Header': 't'
      },
      body: {
        query: 'query { TestOp { t1 t2 } }',
        operationName: null,
        variables: null
      },
      json: true
    }
    const response = await runner(test.context.endpointIp, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.got), { headers: { 'Test-Header': 't' } })
  
    expect(prependHttp(test.context.endpointIp)).toEqual(response.endpoint)
    expect(payload).toEqual(response.options)
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
      headers: {
        'X-Powered-By': 'GotQL - The serverside GraphQL query engine',
        'User-Agent': `GotQL ${require('../package.json').version}`,
        'Accept-Encoding': 'gzip, deflate'
      },
      body: {
        query: 'query ($testVar: string) { TestOp { t1 t2 } }',
        operationName: null,
        variables: { testVar: 't' }
      },
      json: true
    }
    const response = await runner(test.context.endpointIp, query, GotQL.ExecutionType.QUERY, parseToGotInstance(test.context.got))
  
    expect(prependHttp(test.context.endpointIp)).toEqual(response.endpoint)
    expect(payload).toEqual(response.options)
  })
})
