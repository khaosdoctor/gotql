import describe from 'ava'
import sinon from 'sinon'
import prependHttp from 'prepend-http'
import { run as runner } from '../dist/modules/runner'

describe.before(() => {
  console.log = sinon.spy()
})

describe.beforeEach(test => {
  test.context = {}
  test.context = {
    got: {
      post: (endpoint, options) => {
        return new Promise((resolve, reject) => {
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
      post: (endpoint, options) => {
        return new Promise((resolve, reject) => {
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

describe('Should successfully perform a simple query on DNS endpoint', () => {
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
  const response = await runner(assert.context.endpointDns, query, 'query', assert.context.got)

  assert.deepEqual(prependHttp(assert.context.endpointDns), response.endpoint)
  assert.deepEqual(payload, response.options)
})

// --- //

describe('Should successfully perform a simple query on IP endpoint', () => {
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
  const response = await runner(assert.context.endpointIp, query, 'query', assert.context.got)

  assert.deepEqual(prependHttp(assert.context.endpointIp), response.endpoint)
  assert.deepEqual(payload, response.options)
})

// --- //

describe('Should successfully handle a simple query errors on DNS endpoint', () => {
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
  const response = await runner(assert.context.endpointDns, query, 'query', assert.context.gotWithErrors)

  assert.deepEqual(prependHttp(assert.context.endpointDns), response.endpoint)
  assert.deepEqual(payload, response.options)
  assert.deepEqual(500, response.statusCode)
  assert.deepEqual('GraphQL Error', response.message)
})

// --- //

describe('Should successfully handle a simple query errors on IP endpoint', () => {
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
  const response = await runner(assert.context.endpointIp, query, 'query', assert.context.gotWithErrors)

  assert.deepEqual(prependHttp(assert.context.endpointIp), response.endpoint)
  assert.deepEqual(payload, response.options)
  assert.deepEqual(500, response.statusCode)
  assert.deepEqual('GraphQL Error', response.message)
})

// --- //

describe('Should successfully handle a simple query errors with custom codes', () => {
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
  const customCode = 399
  const response = await runner(assert.context.endpointIp, query, 'query', assert.context.gotWithErrors, { debug: false, errorStatusCode: customCode })

  assert.deepEqual(prependHttp(assert.context.endpointIp), response.endpoint)
  assert.deepEqual(payload, response.options)
  assert.deepEqual(customCode, response.statusCode)
  assert.deepEqual('GraphQL Error', response.message)
})

// --- //

describe('Should successfully handle a simple query with custom headers', () => {
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
  const response = await runner(assert.context.endpointIp, query, 'query', assert.context.got, { debug: false, headers: { 'Test-Header': 't' } })

  assert.deepEqual(prependHttp(assert.context.endpointIp), response.endpoint)
  assert.deepEqual(payload, response.options)
})

// --- //

describe('Should successfully handle a simple query with variables', () => {
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
  const response = await runner(assert.context.endpointIp, query, 'query', assert.context.got)

  assert.deepEqual(prependHttp(assert.context.endpointIp), response.endpoint)
  assert.deepEqual(payload, response.options)
})

// --- //

describe('Should successfully handle error when type is not passed', () => {
  const query = {
    operation: {
      name: 'TestOp',
      fields: ['t1', 't2']
    }
  }

  try {
    await runner(assert.context.endpointIp, query, '', assert.context.got)
  } catch (error) {
    assert.deepEqual(error.name, 'Error')
    assert.deepEqual(error.message, 'Runner error: Error when executing query: Query type must be either `query` or `mutation`')
  }
})
