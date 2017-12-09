const Logger = require('./modules/logger')
const runner = require('./modules/runner')

/**
 * @typedef {Object.<string, string>} headerObj
 */
/**
 * @typedef {object} userOpts User Options
 * @prop {boolean} debug Sets debug mode on/off
 * @prop {number} errorStatusCode Default error code to send back to the user on error (defaults to 500)
 * @prop {headerObj} headers Custom headers to be sent along
 */
/**
 * @typedef {object} fieldObj Field properties
 * @prop {Array<string | Object.<string, [fieldObj]>>} [fields] Nested fields
 */
/**
 * @typedef {object} operation An operation object
 * @prop {string} name Operation name
 * @prop {Object.<string, any>} [args] Operation arguments
 * @prop {string} [alias] Operation arguments
 * @prop {Array<string | Object.<string, [fieldObj]>>} fields Field list
 */
/**
 * @typedef {object} queryType An getQL JSON query type
 * @prop {string} [name] Query name (it is needed when there are multiple queries)
 * @prop {operation} operation Operation object
 * @prop {Object.<string, { type: string, value: string }>} [variables] Query variables
 */

/**
 * Performs a query on the specified GraphQL endpoint
 *
 * @param {string} endPoint GraphQL Endpoint
 * @param {queryType} query The JSON getQL query object
 * @param {userOpts} [options] User options
 * @public
 * @return {Promise<any>} A response object containing all the data
 */
function query (endPoint, query, options) {
  const logger = new Logger(options)
  logger.log('Starting a new query')
  return runner.run(endPoint, query, options, 'query')
}

module.exports = query
