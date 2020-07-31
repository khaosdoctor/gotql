import debug from 'debug'
import { parse } from './parser'
import prependHttp from 'prepend-http'
import { GotQL } from '../types/generics'
import { QueryType } from '../types/QueryType'
import { UserOptions } from '../types/UserOptions'
import { RunnerError } from '../errors/RunnerError'
import { Got as GotInstance, Response, Options } from 'got'
const shout = debug('gotql:errors')
const info = debug('gotql:info:runner')

/**
 * Extract the custom header object and mounts it together with the default objects
 *
 * @param {Object.<string, string>} headers Custom header Object
 */
function getHeaders (headers: Record<string, string> = {}) {
  info('Mounting headers using "%o" as provided headers', headers)
  const defaultHeaders = {
    'X-Powered-By': 'GotQL - The server-side GraphQL query engine',
    'User-Agent': `GotQL ${require('../../package.json').version}`,
    'Accept-Encoding': 'gzip, deflate',
    'Response-Type': 'application/json'
  }

  const returnObj = {
    ...defaultHeaders,
    ...headers
  }
  info('Mounted header object: %O', returnObj)
  return returnObj
}

/**
 * Extract variables from the JSON-like query
 *
 * @param {Object.<string, { type: string, value: string }>} variables Variable object
 */
function getQueryVariables (variables?: QueryType['variables']) {
  info('Parsing query variables')
  if (!variables) return null

  let newVars: Record<string, string> = {}
  for (let varName in variables) {
    info('Parsing var "%s"', varName)
    newVars[varName] = variables[varName].value
  }

  info('Variable object created: %O', newVars)
  return newVars
}

/**
 * Creates the Got body object to be sent to the GraphQL endpoint
 *
 * @param {Object.<string, string>} headers Custom header list
 * @param {queryType} query JSON-like query type
 * @param {string} parsedQuery String-parsed query
 */
function getPayload (headers: UserOptions['headers'], query: QueryType, parsedQuery: string) {
  info('Generating final payload')
  const returnObject: Pick<Options, 'json' | 'headers' | 'http2'> = {
    headers: getHeaders(headers),
    json: {
      query: parsedQuery,
      operationName: query.name || null,
      variables: getQueryVariables(query.variables) || null
    }
  }

  info('Payload to be sent: %O', returnObject)
  return returnObject
}

/**
 * Handles Got response object
 *
 * Treats GraphQL errors and messages
 * @param {object} response Got response
 * @param {UserOptions} options User options
 */
function handleResponse (response: Response<any>, options?: UserOptions): GotQL.Response {
  info('Response obtained: %O', { errors: response.body.errors, body: response.body, statusCode: response.statusCode })
  if (response.body.errors) {
    shout('Error on query: %O', response.body.errors)
    response.statusCode = options && options.errorStatusCode ? options.errorStatusCode : 500
    response.statusMessage = 'GraphQL Error'
  }

  const handledResponse = {
    ...JSON.parse(response.body),
    endpoint: response.requestUrl,
    statusCode: response.statusCode,
    message: response.statusMessage
  }
  info('Final response: %O', handledResponse)
  return handledResponse
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
export async function run (endPoint: string, query: QueryType, type: GotQL.ExecutionType, got: GotInstance, options?: UserOptions): Promise<GotQL.Response> {
  try {
    info('Invoking runner with query type %s', type)
    if (!['query', 'mutation'].includes(type)) throw new Error('Query type must be either `query` or `mutation`')

    info('Parsing query: %O', query)
    const graphQuery = parse(query, type) // Parses JSON into GraphQL Query
    info('Parsed query: %s', graphQuery)

    info('Building payload object')
    const headers = options ? options.headers : {}
    const gotPayload = getPayload(headers, query, graphQuery)
    info('Payload object: %O', gotPayload.json)
    info('Sending request...')
    let response = await got.post<Request>(prependHttp(endPoint), gotPayload)

    info('Response: %O', response.body.toString())

    return handleResponse(response, options)
  } catch (error) {
    shout('Error on runner: %O', error)
    throw new RunnerError(`Error when executing query: ${error.message}`)
  }
}
