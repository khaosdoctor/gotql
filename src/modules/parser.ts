import debug from 'debug'
import { GotQL } from '../types/generics'
import { ParserError } from '../errors/ParserError'
import { QueryType, QueryOperation, VariableObject, ArgObject } from '../types/QueryType'
const shout = debug('gotql:errors')
const info = debug('gotql:info:parser')

/**
 * Parses query variables into strings
 * @param {Object.<string, { type: string, value: string }>} variables Variable object
 * @return {string} Parsed variables
 */
function getQueryVars (variables: QueryType['variables']): string {
  info('Getting query variables')
  if (!variables) return ''

  let queryVars = '('
  for (let varName in variables) {
    info('Processing var "%s"', varName)
    queryVars += `$${varName}: ${variables[varName].type}, `
  }
  return queryVars.slice(0, -2) + ') ' // Split last comma
}

/**
 * Parses fields recursively into strings
 * @param {Array<string | Object.<string, [fieldObj]>>} fieldList List of fields
 * @return {string} Parsed fields
 */
function getFields (fieldList: QueryOperation['fields'], variables: QueryType['variables']): string {
  info('Getting fields')
  if (!fieldList) return '' // Return condition, reached bottom of tree
  let fieldStr = ''

  for (let field of fieldList) {
    if (typeof field === 'string') {
      info('Processing field %s', field)
      fieldStr += `${field} ` // Return plain string field
    }
    /* istanbul ignore next */
    else if (typeof field === 'object') {
      const fieldName = Object.keys(field)[0]
      info('Processing field %s', fieldName)
      fieldStr += `${fieldName}${parseArgs(field[fieldName].args, variables)} { ${getFields(field[fieldName].fields, variables)}} ` // Get fields recursively if nested
    }
  }
  info('Parsed field: "%s"', fieldStr)
  return fieldStr
}

/**
 * Takes all argument-like objects and parse them all into a usable argument declaration
 * It also checks for variable existence, variable type and parsing
 * @param argsList {QueryType['operation']['args']} Argument object
 * @param variables {QueryType['variables']} Variable object
 */
function parseArgs (argsList: QueryType['operation']['args'], variables: QueryType['variables']): string {
  if (!argsList) return ''
  let fieldArgs = ''
  info('Parsing args args')
  for (let argName in argsList) {
    info('Parsing arg %s', argName)
    fieldArgs += `${argName}: ${CheckArgs(argsList, argName, variables)}, ` // There'll be a last comma we'll strip later
  }
  fieldArgs = `(${fieldArgs.slice(0, -2)})` // Strips last comma
  info('Obtained args: %s', fieldArgs)
  return fieldArgs
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
  info('Parsing variable "%s" into string', varName)
  let variable = `"${varName}"`
  if (checkIsObject(varName)) variable = `"${(varName as VariableObject).value}"`

  info('Parsed var "%s" equals to: "%s"', varName, variable)
  return variable
}

/**
 * Checks if a given variable is not existent in the query
 * @param {string} varName Variable name without $
 * @param {queryType} query The JSON-Like Query
 */
function isVarUndefined (varName: string, variables: QueryType['variables']) {
  info('Checking if "%s" variable is defined in the query', varName)
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
function CheckArgs (argsList: QueryType['operation']['args'], operationArg: string, variables: QueryType['variables']): string {
  const argValue = argsList![operationArg]
  info('Obtained arg value')
  let parsedVar = getParsedVar(argValue)

  if (checkIsBool(argValue)) return argValue as string

  if (checkIsVar(argValue)) { // Check if is query var, must contain "$" and not be an object
    const varName = (argValue as string).slice(1) // Removes "$" to check for name
    info('Argument is variable "%s"', varName)
    if (isVarUndefined(varName, variables)) throw new Error(`Variable "${varName}" is defined on operation but it has neither a type or a value`)
    return argValue as string
  }

  if (checkIsObject(argValue)) { // Check if arg is object (i.e enum)
    info('Arg is object %O', argValue)
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
  info('Parsing operation %s', operation.name)
  if (!operation.name) throw new Error(`name is required for graphQL operation`)
  if (!operation.fields) throw new Error(`field list is required for operation "${operation.name}"`)

  try {
    let operationArgs = ''
    if (operation.args) {
      info('Parsing args')
      operationArgs = parseArgs(query.operation.args, query.variables)
      info('Operation args are: %s', operationArgs)
    }

    let alias = operation.alias ? `${operation.alias}:` : ''
    const parsedOperation = `${alias} ${operation.name}${operationArgs} { ${getFields(operation.fields, query.variables).trim()} }`.trim()
    info('Parsed operation: %s', parsedOperation)
    return parsedOperation
  } catch (error) {
    shout('Parser error on operation: %O', error)
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
  info('Starting parser with query %O', query)
  try {
    if (!query.operation) throw new Error('a query must have at least one operation')
    if (!type) throw new Error('type must be either "query" or "mutation"')

    let queryName = (query.name) ? `${query.name} ` : ''
    info('Defining name "%s"', queryName)
    const parsedQuery = `${type.trim()} ${queryName}${getQueryVars(query.variables)}{ ${parseOperation(query)} }`.trim()
    info('Parsed query: %s', parsedQuery)
    return parsedQuery
  } catch (error) {
    shout('Parser error: %O', error)
    throw new ParserError(error.message)
  }
}
