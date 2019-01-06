/**
 * @typedef {object} fieldObj Field properties
 * @prop {Array<string | Object.<string, [fieldObj]>>} [fields] Nested fields
 */
/**
 * @typedef {object} operation An operation object
 * @prop {string} name Operation name
 * @prop {Object.<string, any> | Object.<string, {value: string, escape: boolean}>} [args] Operation arguments
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
 * Parses query variables into strings
 * @param {Object.<string, { type: string, value: string }>} variables Variable object
 * @return {string} Parsed variables
 */
function getQueryVars (variables) {
  if (!variables) return ''

  let queryVars = '('
  for (let varName in variables) {
    queryVars += `$${varName}: ${variables[varName].type}, `
  }
  return queryVars.slice(0, -2) + ') ' // Split last comma
}

/**
 * Parses fields recursively into strings
 * @param {Array<string | Object.<string, [fieldObj]>>} fieldList List of fields
 * @return {string} Parsed fields
 */
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

/**
 * Outputs true if the argument is a boolean
 * @param {string} varName Variable value
 * @return {boolean} True if it is a boolean
 */
function checkIsBool (varValue) {
  return (typeof varValue === typeof true)
}

/**
 * Checks if the value is an object
 * @param {any} varName Object to be checked
 * @return {boolean} True if is object
 */
function checkIsObject (varName) {
  return (typeof varName === 'object' && varName.value)
}

/**
 * Outputs true if the argument is a variable
 * @param {string|object} varName Variable value or object
 * @return {boolean} True if it is a variable
 */
function checkIsVar (varName) {
  if (checkIsObject(varName)) return false
  return varName.indexOf('$') === 0
}

/**
 * Parses the variable name into a string to be used.
 *
 * If variable is an object, then it is a query variable and must be treated differently
 * @param {string|object} varName Variable value or object
 * @return {string} Parsed variablename
 */
function getParsedVar (varName) {
  if (checkIsObject(varName)) return `"${varName.value}"`
  return `"${varName}"`
}

/**
 * Checks if the operation argument is a variable or not
 *
 * Also checks if the variables are indeed set in the query before using it in the operation
 * @param {queryType} query The JSON-like query
 * @param {string} operationArg Argument name
 * @returns {string} Parsed operation argument
 */
function checkArgVar (query, operationArg) {
  const argValue = query.operation.args[operationArg]
  let parsedVar = getParsedVar(argValue)

  switch(true) {
    case checkIsBool(argValue):
      parsedVar = argValue
      break

    case checkIsVar(argValue):
      parsedVar = argValue
      const varName = parsedVar.slice(1) // Removes "$" to check for name

      if (!query.variables || !query.variables[varName] || !query.variables[varName].type || !query.variables[varName].value) {
        throw new Error(`Variable "${varName}" is defined on operation but it has neither a type or a value`)
      }

      break

    case checkIsObject(argValue):
      if (!argValue.escape)
        parsedVar = argValue.value
      break

    default:
      break
  }

  return parsedVar
}

/**
 * Parses the operation bit of the query
 * @param {queryType} query The JSON-Like query to be parsed
 * @return {string} Parsed operation query
 */
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
    throw new Error(`Failed to parse operation "${query.operation.name}" => ${error.message}`)
  }
}

/**
 * Parses a JSON-like query into a string
 * @param {queryType} query The JSON-like query to be parsed
 * @param {string} type Can be 'query' or 'mutation'
 * @return {string} Parsed query
 */
function parse (query, type) {
  try {
    if (!query.operation) throw new Error('a query must have at least one operation')
    if (!type) throw new Error('type must be either "query" or "mutation"')

    let queryName = (query.name) ? `${query.name} ` : ''
    return `${type.trim()} ${queryName}${getQueryVars(query.variables)}{ ${parseOperation(query)} }`.trim()
  } catch (error) {
    throw new Error(`Parse error: ${error.message}`)
  }
}

module.exports = parse
