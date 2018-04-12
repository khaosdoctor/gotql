'use strict';

let run = (() => {
  var _ref = _asyncToGenerator(function* (endPoint, query, options, type, got) {
    try {
      if (!['query', 'mutation'].includes(type)) throw new Error('Query type must be either `query` or `mutation`');

      const logger = new Logger(options);

      logger.log(`Parsing query: ${JSON.stringify(query)}`);
      const graphQuery = parse(query, type);
      logger.log(`Parsed query: ${graphQuery}`);

      logger.log('Building payload object');
      const gotPayload = getPayload(options.headers, query, graphQuery);
      logger.log(`Payload object: ${JSON.stringify(gotPayload.body)}`);

      let response = yield got.post(prependHttp(endPoint), gotPayload);
      logger.log(`Response: ${response.body.toString()}`);
      return handleResponse(response, options);
    } catch (error) {
      throw new Error(`Error when executing query: ${error.message}`);
    }
  });

  return function run(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const parse = require('./parser');
const Logger = require('./logger');
const prependHttp = require('prepend-http');

function getHeaders(headers) {
  if (!headers) headers = {};
  const defaultHeaders = {
    'X-Powered-By': 'GotQL - The serverside GraphQL query engine',
    'User-Agent': `GotQL ${require('../../package.json').version}`,
    'Accept-Encoding': 'gzip, deflate'
  };

  return Object.assign({}, headers, defaultHeaders);
}

function getQueryVariables(variables) {
  if (!variables) return null;
  let newVars = {};
  for (let varName in variables) {
    newVars[varName] = variables[varName].value;
  }
  return newVars;
}

function getPayload(headers, query, parsedQuery) {
  return {
    headers: getHeaders(headers),
    body: {
      query: parsedQuery,
      operationName: query.name || null,
      variables: getQueryVariables(query.variables) || null
    },
    json: true
  };
}

function handleResponse(response, options) {
  if (response.body.errors) {
    response.statusCode = options.errorStatusCode || 500;
    response.statusMessage = 'GraphQL Error';
  }

  return Object.assign({}, response.body, { statusCode: response.statusCode, message: response.statusMessage });
}

module.exports = { run };
//# sourceMappingURL=runner.js.map