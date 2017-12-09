const got = require('got')
const parser = require('./modules/parser')
const Logger = require('./modules/logger')
let userOptions = {}

function getHeaders (headers) {
  const defaultHeaders = {
    'X-Powered-By': 'GetQL - The serverside GraphQL query engine',
    'Content-Type': 'application/json',
    'User-Agent': 'GetQL'
  }

  return Object.assign(headers, defaultHeaders)
}

function getPayload (headers, query, parsedQuery) {
  return {
    headers: getHeaders(headers),
    body: {
      query: parsedQuery,
      operationName: query.name || null,
      variables: query.variables || null
    },
    json: true
  }
}

function handleResponse (response) {
  if (response.body.errors) {
    response.statusCode = userOptions.errorStatusCode || 500
  }

  return response
}

function run (endPoint, query, options, type) {
  try {
    userOptions = options
    const logger = new Logger(options) // Instantiate logger to log messages

    logger.log(`Parsing query: ${console.log(query)}`)
    const graphQuery = parser.parse(query, type) // Parses JSON into GraphQL Query
    logger.log(`Parsed query: ${graphQuery}`)

    logger.log('Building payload object')
    const gotPayload = getPayload(options.headers, query, graphQuery)
    logger.log(`Payload object: ${gotPayload.body}`)

    return got.post(endPoint, gotPayload)
      .then(response => {
        logger.log(`Response: ${JSON.stringify(response)}`)
        return response
      })
      .then(handleResponse)
      .catch(err => { throw new Error(`Error executing GraphQL call: ${err.message}`) })
  } catch (error) {
    throw new Error(`Error when executing query: ${error.message}`)
  }
}

module.exports = { run }
