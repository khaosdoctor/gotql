'use strict';

function getQueryVars(variables) {
  if (!variables) return '';

  let queryVars = '(';
  for (let varName in variables) {
    queryVars += `$${varName}: ${variables[varName].type}, `;
  }
  return queryVars.slice(0, -2) + ') ';
}

function getFields(fieldList) {
  if (!fieldList) return '';
  let fieldStr = '';
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = fieldList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      let field = _step.value;

      if (typeof field === 'string') fieldStr += `${field} `;else if (typeof field === 'object') {
          fieldStr += `${Object.keys(field)[0]} { ${getFields(field[Object.keys(field)[0]].fields)}} `;
        }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return fieldStr;
}

function checkIsObject(varName) {
  return typeof varName === 'object' && varName.value;
}

function checkIsVar(varName) {
  if (checkIsObject(varName)) return false;
  return varName.indexOf('$') === 0;
}

function getParsedVar(varName) {
  if (checkIsObject(varName)) return `"${varName.value}"`;
  return `"${varName}"`;
}

function checkArgVar(query, operationArg) {
  const argValue = query.operation.args[operationArg];
  let parsedVar = getParsedVar(argValue);

  if (checkIsVar(argValue)) {
    parsedVar = argValue;
    const varName = parsedVar.slice(1);

    if (!query.variables || !query.variables[varName] || !query.variables[varName].type || !query.variables[varName].value) {
      throw new Error(`Variable "${varName}" is defined on operation but it has neither a type or a value`);
    }
  } else if (checkIsObject(argValue)) {
    if (!argValue.escape) {
      parsedVar = argValue.value;
    }
  }

  return parsedVar;
}

function parseOperation(query) {
  let operation = query.operation;
  if (!operation.name) throw new Error(`name is required for graphQL operation`);
  if (!operation.fields) throw new Error(`field list is required for operation "${operation.name}"`);

  try {
    let operationArgs = '';
    if (operation.args) {
      for (let argName in operation.args) {
        operationArgs += `${argName}: ${checkArgVar(query, argName)}, `;
      }
      operationArgs = `(${operationArgs.slice(0, -2)})`;
    }

    let alias = operation.alias ? `${operation.alias}:` : '';
    return `${alias} ${operation.name}${operationArgs} { ${getFields(operation.fields).trim()} }`.trim();
  } catch (error) {
    throw new Error(`Failed to parse operation "${query.operation.name}" => ${error.message}`);
  }
}

function parse(query, type) {
  try {
    if (!query.operation) throw new Error('a query must have at least one operation');
    if (!type) throw new Error('type must be either "query" or "mutation"');

    let queryName = query.name ? `${query.name} ` : '';
    return `${type.trim()} ${queryName}${getQueryVars(query.variables)}{ ${parseOperation(query)} }`.trim();
  } catch (error) {
    throw new Error(`Parse error: ${error.message}`);
  }
}

module.exports = parse;
//# sourceMappingURL=parser.js.map