import { QueryType, QueryOperation, VariableObject, ArgObject } from '../types/QueryType'
import { GotQL } from '../types/generics';

/**
 * Parses query variables into strings
 * @param {Object.<string, { type: string, value: string }>} variables Variable object
 * @return {string} Parsed variables
 */
function getQueryVars (variables: QueryType['variables']): string {
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
function getFields (fieldList: QueryOperation['fields']): string {
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
 * Checks if the value is an object
 * @param {any} varName Object to be checked
 * @return {boolean} True if is object
 */
function checkIsObject (varName: any): boolean {
  return !!(typeof varName === 'object' && varName.value)
}

/**
 * Outputs true if the argument is a boolean
 * @param {string} varName Variable value
 * @return {boolean} True if it is a boolean
 */
function checkIsBool (varValue: any): boolean {
  return (typeof varValue === typeof true)
}

/**
 * Outputs true if the argument is a variable
 * @param {string|object} varName Variable value or object
 * @return {boolean} True if it is a variable
 */
function checkIsVar (varName: any): boolean {
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
function getParsedVar (varName: string | VariableObject | ArgObject): string {
  if (checkIsObject(varName)) return `"${(varName as VariableObject).value}"`
  return `"${varName}"`
}

/**
 * Checks if a given variable is not existent in the query
 * @param {string} varName Variable name without $
 * @param {queryType} query The JSON-Like Query
 */
function isVarUndefined (varName: string, { variables }: QueryType) {
  return !variables || !variables[varName] || !variables[varName].type || !variables[varName].value
}

/**
 * Checks if the operation argument is a variable or not
 *
 * Also checks if the variables are indeed set in the query before using it in the operation
 * @param {queryType} query The JSON-like query
 * @param {string} operationArg Argument name
 * @returns {string} Parsed operation argument
 */
function checkArgVar (query: QueryType, operationArg: string): string {
  const argValue = query.operation.args![operationArg]
  let parsedVar = getParsedVar(argValue)

  if (checkIsBool(argValue)) return argValue as string

  if (checkIsVar(argValue)) { // Check if is query var, must contain "$" and not be an object
    const varName = (argValue as string).slice(1) // Removes "$" to check for name
    if (isVarUndefined(varName, query)) throw new Error(`Variable "${varName}" is defined on operation but it has neither a type or a value`)
    return argValue as string
  }

  if (checkIsObject(argValue)) { // Check if arg is object (i.e enum)
    if (!(argValue as ArgObject).escape) return (argValue as ArgObject).value
  }

  return parsedVar
}

/**
 * Parses the operation bit of the query
 * @param {queryType} query The JSON-Like query to be parsed
 * @return {string} Parsed operation query
 */
function parseOperation (query: QueryType): string {
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
export function parse (query: QueryType, type: GotQL.ExecutionType): string {
  try {
    if (!query.operation) throw new Error('a query must have at least one operation')
    if (!type) throw new Error('type must be either "query" or "mutation"')

    let queryName = (query.name) ? `${query.name} ` : ''
    return `${type.trim()} ${queryName}${getQueryVars(query.variables)}{ ${parseOperation(query)} }`.trim()
  } catch (error) {
    throw new Error(`Parse error: ${error.message}`)
  }
}
