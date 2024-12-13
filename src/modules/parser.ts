import debug from 'debug'
import { ParserError } from '../errors/ParserError'
import { GotQL } from '../types/generics'
import { ArgObject, QueryOperation, QueryType, VariableObject } from '../types/QueryType'
const shout = debug('gotql:errors')
const info = debug('gotql:info:parser')

/**
 * Parses query variables into strings
 * @param {Object.<string, { type: string, value: string }>} variables Variable object
 * @return {string} Parsed variables
 */
function getQueryVars (variables: QueryType['variables']): string {
  info('Getting query variables')
  if (!variables || Object.keys(variables).length === 0) return ''

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
  info('Parsing args %O', argsList)
  for (let argName in argsList) {
    info('Parsing arg "%s"', argName)
    fieldArgs += `${argName}: ${checkArgs(argsList, argName, variables)}, ` // There'll be a last comma we'll strip later
  }
  fieldArgs = `(${fieldArgs.slice(0, -2)})` // Strips last comma
  info('Obtained args: %s', fieldArgs)
  return fieldArgs
}

/**
 * Checks if the value is an usable object.
 *
 * An usable object is an object gotQL can use to determine its value. This is an object with keys: { escape: boolean, value: any }
 * @param {any} varName Object to be checked
 * @return {boolean} True if is object
 */
function isUsableObject (varName: any): boolean {
  info(`checking if ${JSON.stringify(varName)} is object:`, `type: ${typeof varName}`)
  const result = !!(typeof varName === 'object' && varName?.value)
  info(`is ${result ? '' : 'not'} an usable object`)
  return result
}

/**
 * Outputs true if the argument is a boolean
 * @param {string} varName Variable value
 * @return {boolean} True if it is a boolean
 */
function isBool (varValue: any): boolean {
  return (typeof varValue === typeof true)
}

/**
 * Outputs true if the argument is a variable
 * @param {string|object} varName Variable value or object
 * @return {boolean} True if it is a variable
 */
function isVar (varName: any): boolean {
  if (isUsableObject(varName) || typeof varName !== 'string') return false
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
  if (isUsableObject(varName)) variable = `"${(varName as VariableObject).value}"`

  info('Parsed var "%s" equals to: %s', varName, variable)
  return variable
}

/**
 * Checks if a given variable is not existent in the query
 * @param {string} varName Variable name without $
 * @param {queryType} query The JSON-Like Query
 */
function isVarUndefined (varName: string, variables: QueryType['variables']) {
  info('Checking if "%s" variable is defined in the query', varName)
  return !variables || !variables[varName] || !variables[varName].type || variables[varName].value === undefined
}

function isArray (value: any) {
  const result = Array.isArray(value)
  info(`Checking if ${JSON.stringify(value)} is an Array: ${result}`)
  return result
}

/**
 * Check against "Null" only
 * @param value Argument Value
 */
function isNull (value: any) {
  info(`Checking if ${JSON.stringify(value)} is 'null'`)
  return value === null
}

/**
 * Check if argument is an object which cannot be used as arg.value
 *
 * @param argList List of arguments
 */
function isArgNestedObject (argList: any) {
  info('Checking for nested argument objects without escape or value')
  return !isUsableObject(argList) && typeof argList === 'object'
}

/**
 * If an argument list is like:
 * {
 *  args: {
 *    arg1: {
 *      arg2: string,
 *      arg3: string
 *    }
 *  }
 * }
 *
 * Then this is not an usable object of type { value: any, escape: boolean } which is the main configuration option for gotQL's objects. Thus, we need to iterate over them to build a nested argument list for the spec
 *
 * @returns {string} A argument list like argName: { nestedArgName1: "nestedArgValue" }
 */
function parseNestedArgument (nestedArgList: QueryType['operation']['args'], variables: QueryType['variables']): string {
  let parsedNestedArg: string = '{ '
  for (let argument in nestedArgList as any) {
    info('Parsing nested argument "%s"', argument)
    parsedNestedArg += `${argument}: ${checkArgs(nestedArgList, argument, variables)},`
  }

  // Removing trailing comma, add spaces to commas and final curly braces
  const parsedFinalString = `${parsedNestedArg.slice(0, -1).replace(',', ', ')} }`

  info('Obtained nested arg "%s"', parsedFinalString)
  return parsedFinalString
}

function parseArgsArray(item: any, variables: QueryType['variables'] ) {
  const parsedArray = Object.keys(item).map(key => ` ${key}: ${checkArgs(item, key, variables)} `)
  return `{${parsedArray.join(',')}}`
}

/**
 * Checks if the operation argument is a variable or not
 *
 * Also checks if the variables are indeed set in the query before using it in the operation
 * @param {QueryType['operation']['args']} argsList The list of arguments in the query
 * @param {string} operationArg Argument name
 * @param {QueryType['variables']} variables Variables list
 * @returns {string} Parsed operation argument
 */
function checkArgs (argsList: QueryType['operation']['args'], operationArg: string, variables: QueryType['variables']): string {
  const argValue = argsList![operationArg]
  info(`Obtained arg value of %O for %s`, argValue, operationArg)
  if (isNull(argValue)) return 'null' // Check for strict null values (#33)
  if (isArray(argValue)) {
    const parsedArray = (argValue as unknown as Array<any>).map((item: any) => {
      const returnByType: Record<string, any> = {
        object: (item: any) => parseArgsArray(item, variables),
        string: (item: any) => `"${item}"`
      }

      const fn = returnByType[ typeof item ]

      return fn ? fn(item) : item
    })
    return `[${(parsedArray).join(',')}]` // Check for array values (#35)
  }

  // Issue #28: Allow support for nested arguments
  if (isArgNestedObject(argValue)) {
    info('Argument "%s" is a nested argument, parsing...', operationArg)
    return parseNestedArgument(argValue as QueryType['operation']['args'], variables)
  }

  if (isBool(argValue)) return argValue as string

  if (isVar(argValue)) { // Check if is query var, must contain "$" and not be an object
    const varName = (argValue as string).slice(1) // Removes "$" to check for name
    info('Argument is variable "%s"', varName)
    if (isVarUndefined(varName, variables)) throw new Error(`Variable "${varName}" is defined on operation but it has neither a type or a value`)
    return argValue as string
  }

  if (isUsableObject(argValue)) { // Check if arg is object (i.e enum)
    info('Arg is object %O', argValue)
    if (!(argValue as { escape: boolean, value: any }).escape) return (argValue as { escape: boolean, value: any }).value
  }

  return getParsedVar(argValue)
}

/**
 * Parses the operation bit of the query
 * @param {QueryType} query The JSON-Like query to be parsed
 * @param {boolean} allowEmptyFields If 'true', empty fields are allowed (WARNING: this is not considered a good practice)
 * @return {string} Parsed operation query
 */
function parseOperation (query: QueryType, allowEmptyFields: boolean = false): string {
  let operation = query.operation
  const hasEmptyFields = !operation.fields || !operation.fields.length
  info('Parsing operation %s', operation.name)
  if (!operation.name) throw new Error(`name is required for graphQL operation`)
  if (hasEmptyFields && !allowEmptyFields) throw new Error(`field list is required for operation "${operation.name}"`)

  if(hasEmptyFields) info('Hint: Returning no fields is not considered a good practice')

  try {
    let operationArgs = ''
    if (operation.args && Object.keys(operation.args).length > 0) {
      info('Parsing args')
      operationArgs = parseArgs(query.operation.args, query.variables)
      info('Operation args are: %s', operationArgs)
    }

    let alias = operation.alias ? `${operation.alias}:` : ''
    const parsedOperation = hasEmptyFields
        ?`${alias} ${operation.name}${operationArgs}`.trim()
        :`${alias} ${operation.name}${operationArgs} { ${getFields(operation.fields, query.variables).trim()} }`.trim()
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
    const parsedQuery = `${type.trim()} ${queryName}${getQueryVars(query.variables)}{ ${parseOperation(query, type === GotQL.ExecutionType.MUTATION)} }`.trim()
    info('Parsed query: %s', parsedQuery)
    return parsedQuery
  } catch (error) {
    shout('Parser error: %O', error)
    throw new ParserError(error.message)
  }
}
