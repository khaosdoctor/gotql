/**
 * @typedef {object} queryType An getQL JSON query type
 * @prop {string} [name] Query name (it is needed when there are multiple queries)
 * @prop {operation} operation Operation object
 * @prop {Object.<string, { type: string, value: string }>} [variables] Query variables
 */
export type QueryType = {
  name?: string,
  operation: QueryOperation,
  variables?: {
    [name: string]: VariableObject
  }
}

export type VariableObject = {
  type: string
  value: string
}

/**
 * @typedef {object} operation An operation object
 * @prop {string} name Operation name
 * @prop {Object.<string, any> | Object.<string, {value: string, escape: boolean}>} [args] Operation arguments
 * @prop {string} [alias] Operation arguments
 * @prop {Array<string | Object.<string, [fieldObj]>>} fields Field list
 */
export type QueryOperation = {
  name: string
  args?: {
    [name: string]: string | ArgObject
  },
  alias?: string
  fields: Array<string | FieldObject>
}

export type ArgObject = {
  value: string
  escape: boolean
}

/**
 * @typedef {object} fieldObj Field properties
 * @prop {Array<string | Object.<string, [fieldObj]>>} [fields] Nested fields
 */
export type FieldObject = {
  [name: string]: {
    args?: {
      [name: string]: string | ArgObject
    },
    fields: Array<string | FieldObject>
  }
}
