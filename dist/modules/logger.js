"use strict";

class Logger {
  constructor(debug) {
    this._debug = debug || false;
  }

  log(message) {
    if (this._debug) console.log(message);
  }
}

module.exports = Logger;
//# sourceMappingURL=logger.js.map