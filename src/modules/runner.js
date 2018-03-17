const parse = require('./parser')
const Logger = require('./logger')
const prependHttp = require('prepend-http')

/**
 * Extract the custom header object and mounts it together with the default objects
 *
 * @param {Object.<string, string>} headers Custom header Object
 */
function getHeaders (headers) {
  if (!headers) headers = {}
  const defaultHeaders = {
    'X-Powered-By': 'GotQL - The serverside GraphQL query engine',
    'User-Agent': `GotQL ${require('../../package.json').version}`,
    'Accept-Encoding': 'gzip, deflate'
  }

  return Object.assign({}, headers, defaultHeaders)
}

/**
 * Extract variables from the JSON-like query
 *
 * @param {Object.<string, { type: string, value: string }>} variables Variable object
 */
function getQueryVariables (variables) {
  if (!variables) return null
  let newVars = {}
  for (let varName in variables) {
    newVars[varName] = variables[varName].value
  }
  return newVars
}

/**
 * Creates the Got body object to be sent to the GraphQL endpoint
 *
 * @param {Object.<string, string>} headers Custom header list
 * @param {queryType} query JSON-like query type
 * @param {string} parsedQuery String-parsed query
 */
function getPayload (headers, query, parsedQuery) {
  return {
    headers: getHeaders(headers),
    body: {
      query: parsedQuery,
      operationName: query.name || null,
      variables: getQueryVariables(query.variables) || null
    },
    json: true
  }
}

/**
 * Handles Got response object
 *
 * Treats GraphQL errors and messages
 * @param {object} response Got response
 * @param {userOpts} options User options
 */
function handleResponse (response, options) {
  if (response.body.errors) {
    response.statusCode = options.errorStatusCode || 500
    response.statusMessage = 'GraphQL Error'
  }

  return Object.assign({}, response.body, { statusCode: response.statusCode, message: response.statusMessage })
}

/**
 *
 * @param {string} endPoint GraphQL endpoint to query on
 * @param {queryType} query A JSON-like query type
 * @param {userOpts} [options] User options
 * @param {string} type Can be 'query' or 'mutation'
 * @param {any} got The Got object as an injected dependency (for test modularity)
 * @return {{data: object, statusCode: number, message: string}} Got handled response
 */
async function run (endPoint, query, options, type, got) {
  try {
    if (!['query', 'mutation'].includes(type)) throw new Error('Query type must be either `query` or `mutation`')

    const logger = new Logger(options) // Instantiate logger to log messages

    logger.log(`Parsing query: ${JSON.stringify(query)}`)
    const graphQuery = parse(query, type) // Parses JSON into GraphQL Query
    logger.log(`Parsed query: ${graphQuery}`)

    logger.log('Building payload object')
    const gotPayload = getPayload(options.headers, query, graphQuery)
    logger.log(`Payload object: ${JSON.stringify(gotPayload.body)}`)

    let response = await got.post(prependHttp(endPoint), gotPayload)
    logger.log(`Response: ${response.body.toString()}`)
    return handleResponse(response, options)
  } catch (error) {
    throw new Error(`Error when executing query: ${error.message}`)
  }
}

module.exports = { run }
