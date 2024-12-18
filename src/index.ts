/* istanbul ignore file */
import { query } from './query'
import { mutation } from './mutation'
import { parse as parser } from './modules/parser'
import { fragment, literal } from './helpers'

module.exports = { query, mutation, parser, literal, fragment }
export { query, mutation, parser, literal, fragment }
