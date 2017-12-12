function getQueryVars (variables) {
  if (!variables) return ''

  let queryVars = '('
  for (let varName in variables) {
    queryVars += `$${varName}: ${variables[varName].type}, `
  }
  return queryVars.slice(0, -2) + ') ' // Split last comma
}

function getFields (fieldList) {
  if (!fieldList) return '' // Return condition, reached bottom of tree
  let fieldStr = ''
  for (let field of fieldList) {
    if (typeof field === 'string') fieldStr += `${field} ` // Return plain string field
    /* istanbul ignore next */
    else if (typeof field === 'object') {
      fieldStr += `${Object.keys(field)[0]} { ${getFields(field[Object.keys(field)[0]].fields)}} ` // Get fields recursively if nested
    }
  }
  return fieldStr
}

function checkArgVar (query, operationArg) {
  const isVar = (query.operation.args[operationArg].indexOf('$') === 0)
  let parsedVar = `"${query.operation.args[operationArg]}"`

  if (isVar) {
    parsedVar = query.operation.args[operationArg]
    if (!query.variables || !query.variables[operationArg] || !query.variables[operationArg].type || !query.variables[operationArg].value) {
      throw new Error(`Variable "${operationArg}" is defined on operation but it has neither a type or a value`)
    }
  }

  return parsedVar
}

function parseOperation (query) {
  let operation = query.operation
  if (!operation.name) throw new Error(`name is required for graphQL operation`)
  if (!operation.fields) throw new Error(`field list is required for operation "${operation.name}"`)

  try {
    let operationArgs = ''
    if (operation.args) {
      for (let argName in operation.args) {
        operationArgs += `${argName}: ${checkArgVar(query, argName)}, ` // There'll be a last comma we'll strip later
      }
      operationArgs = `(${operationArgs.slice(0, -2)})`
    }

    let alias = operation.alias ? `${operation.alias}:` : ''
    return `${alias} ${operation.name}${operationArgs} { ${getFields(operation.fields).trim()} }`.trim()
  } catch (error) {
    throw new Error(`Failed to parse operation ${query.operation.name} => ${error.message}`)
  }
}

function parse (query, type) {
  try {
    if (!query.operation) throw new Error('a query must have at least one operation')

    let queryName = (query.name) ? `${query.name} ` : ''
    return `${type.trim()} ${queryName}${getQueryVars(query.variables)}{ ${parseOperation(query)} }`.trim()
  } catch (error) {
    throw new Error(`Parse error: ${error.message}`)
  }
}

module.exports = { parse }
