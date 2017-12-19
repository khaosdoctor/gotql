/**
 * Logger to debug information
 * @class Logger
 * @public
 *
 */
class Logger {
  /**
   * Constructs Logger
   * @param {boolean} debug If true, will log
   */
  constructor (debug) {
    this._debug = debug || false
  }

  /**
   * Logs a message if Debug is true
   * @param {string} message Message to be logged
   */
  log (message) {
    if (this._debug) console.log(message)
  }
}

module.exports = Logger
