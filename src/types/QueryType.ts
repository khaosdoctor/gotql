import { LiteralObject } from './Literal'
/**
 * @typedef {object} queryType An gotQL JSON query type
 * @prop {string} [name] Query name (it is needed when there are multiple queries)
 * @prop {operation} operation Operation object
 * @prop {Object.<string, { type: string, value: string }>} [variables] Query variables
 */
export type QueryType = {
  name?: string,
  operation: QueryOperation,
  variables?: Record<string, VariableObject>
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
  args?: Record<string, string | ArgObject>,
  alias?: string
  fields: Array<string | FieldObject>
}

type Primitive = string | number | boolean
type OneOrMore<T> = T | T[]

export type ArgObject = {
  [name: string]: OneOrMore<ArgObject | Primitive>
} | LiteralObject | Array<ArgObject | Primitive>

/**
 * @typedef {object} fieldObj Field properties
 * @prop {Array<string | Object.<string, [fieldObj]>>} [fields] Nested fields
 */
export type FieldObject = Record<string, {
  args?: Record<string, string | ArgObject>
  fields: Array<string | FieldObject>
}>
