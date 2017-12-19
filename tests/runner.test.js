import describe from 'ava'
import runner from '../src/modules/runner'
import sinon from 'sinon'

describe.before(test => {
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

describe('Should successfully perform a simple query on DNS endpoint', async (assert) => {
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
  const response = await runner.run(assert.context.endpointDns, query, { debug: false }, 'query', assert.context.got)

  assert.deepEqual(require('prepend-http')(assert.context.endpointDns), response.endpoint)
  assert.deepEqual(payload, response.options)
})

// --- //

describe('Should successfully perform a simple query on IP endpoint', async (assert) => {
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
  const response = await runner.run(assert.context.endpointIp, query, { debug: false }, 'query', assert.context.got)

  assert.deepEqual(require('prepend-http')(assert.context.endpointIp), response.endpoint)
  assert.deepEqual(payload, response.options)
})

// --- //

describe('Should successfully handle a simple query errors on DNS endpoint', async (assert) => {
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
  const response = await runner.run(assert.context.endpointDns, query, { debug: false }, 'query', assert.context.gotWithErrors)

  assert.deepEqual(require('prepend-http')(assert.context.endpointDns), response.endpoint)
  assert.deepEqual(payload, response.options)
  assert.deepEqual(500, response.statusCode)
  assert.deepEqual('GraphQL Error', response.message)
})

// --- //

describe('Should successfully handle a simple query errors on IP endpoint', async (assert) => {
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
  const response = await runner.run(assert.context.endpointIp, query, { debug: false }, 'query', assert.context.gotWithErrors)

  assert.deepEqual(require('prepend-http')(assert.context.endpointIp), response.endpoint)
  assert.deepEqual(payload, response.options)
  assert.deepEqual(500, response.statusCode)
  assert.deepEqual('GraphQL Error', response.message)
})

// --- //

describe('Should successfully handle a simple query errors with custom codes', async (assert) => {
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
  const response = await require('../src/modules/runner').run(assert.context.endpointIp, query, { debug: false, errorStatusCode: customCode }, 'query', assert.context.gotWithErrors)

  assert.deepEqual(require('prepend-http')(assert.context.endpointIp), response.endpoint)
  assert.deepEqual(payload, response.options)
  assert.deepEqual(customCode, response.statusCode)
  assert.deepEqual('GraphQL Error', response.message)
})

// --- //

describe('Should successfully handle a simple query with custom headers', async (assert) => {
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
  const response = await require('../src/modules/runner').run(assert.context.endpointIp, query, { debug: false, headers: {'Test-Header': 't'} }, 'query', assert.context.got)

  assert.deepEqual(require('prepend-http')(assert.context.endpointIp), response.endpoint)
  assert.deepEqual(payload, response.options)
})

// --- //

describe('Should successfully handle a simple query with variables', async (assert) => {
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
  const response = await require('../src/modules/runner').run(assert.context.endpointIp, query, { debug: false }, 'query', assert.context.got)

  assert.deepEqual(require('prepend-http')(assert.context.endpointIp), response.endpoint)
  assert.deepEqual(payload, response.options)
})

// --- //

describe('Should successfully handle error when type is not passed', async (assert) => {
  const query = {
    operation: {
      name: 'TestOp',
      fields: ['t1', 't2']
    }
  }

  try {
    await require('../src/modules/runner').run(assert.context.endpointIp, query, { debug: false }, '', assert.context.got)
  } catch (error) {
    assert.deepEqual(error.name, 'Error')
    assert.deepEqual(error.message, 'Error when executing query: Query type must be either `query` or `mutation`')
  }
})
