const Logger = require('./modules/logger')
const runner = require('./modules/runner')

function query (endPoint, query, options) {
  const logger = new Logger(options)
  logger.log('Starting a new query')
  return runner.run(endPoint, query, options, 'query')
}

module.exports = query
