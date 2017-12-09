function getQueryVars (variables) {
  if (!variables) return ''

  let queryVars = '('
  for (let varName in variables) {
    queryVars += `$${varName}: ${variables[varName].type}, `
  }
  return queryVars.slice(0, -2) + ')' // Split last comma
}

function getFields (fieldList) {
  if (!fieldList) return '' // Return condition, reached bottom of tree
  let fieldStr = ''
  for (let field of fieldList) {
    if (typeof field === 'string') fieldStr += `${field} ` // Return plain string field
    else if (typeof field === 'object') fieldStr += `${Object.keys(field)[0]} { ${getFields(field[Object.keys(field)[0]].fields)}} ` // Get fields recursively if nested
  }
  return fieldStr
}

function parseOperation (operation) {
  let operationArgs = ''
  if (operation.args) {
    for (let argName in operation.args) {
      // Check if arg is a variable
      let argValue = (operation.args[argName].indexOf('$') === 0) ? operation.args[argName] : `"${operation.args[argName]}"`
      operationArgs += `${argName}: ${argValue}, ` // There'll be a last comma we'll strip later
    }
  }

  let alias = operation.alias ? `${operation.alias}:` : ''
  return `${alias} ${operation.name}(${operationArgs.slice(0, -2)}) { ${getFields(operation.fields).trim()} }`.trim()
}

function parse (query, type) {
  return `${type} ${query.name || ''}${getQueryVars(query.variables)} { ${parseOperation(query.operation)} }`.trim()
}

module.exports = { parse }
