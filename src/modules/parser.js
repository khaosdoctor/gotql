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
    else if (typeof field === 'object') fieldStr += `${Object.keys(field)[0]} { ${getFields(field[Object.keys(field)[0]].fields)}} ` // Get fields recursively if nested
  }
  return fieldStr
}

function parseOperation (operation) {
  if (!operation.name) throw new Error(`name is required for graphQL operation`)
  if (!operation.fields) throw new Error(`field list is required for operation ${operation.name}`)

  try {
    let operationArgs = ''
    if (operation.args) {
      for (let argName in operation.args) {
        // Check if arg is a variable
        let argValue = (operation.args[argName].indexOf('$') === 0) ? operation.args[argName] : `"${operation.args[argName]}"`
        operationArgs += `${argName}: ${argValue}, ` // There'll be a last comma we'll strip later
      }
      operationArgs = `(${operationArgs.slice(0, -2)})`
    }

    let alias = operation.alias ? `${operation.alias}:` : ''
    return `${alias} ${operation.name}${operationArgs} { ${getFields(operation.fields).trim()} }`.trim()
  } catch (error) {
    throw error
  }
}

function parse (query, type) {
  try {
    if (!query.operation) throw new Error('a query must have at least one operation')

    let queryName = (query.name) ? `${query.name} ` : ''
    return `${type.trim()} ${queryName}${getQueryVars(query.variables)}{ ${parseOperation(query.operation)} }`.trim()
  } catch (error) {
    throw new Error(`Parse error: ${error.message}`)
  }
}

module.exports = { parse }
