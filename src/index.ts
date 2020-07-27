/* istanbul ignore file */
import { query } from './query'
import { mutation } from './mutation'
import { parse as parser } from './modules/parser'

module.exports = { query, mutation, parser }
export { query, mutation, parser }
