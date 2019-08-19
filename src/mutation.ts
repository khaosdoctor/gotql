import got from 'got'
import debug from 'debug'
import { run } from './modules/runner'
import { QueryType } from './types/QueryType'
import { GotQL } from './types/generics'
import { UserOptions } from './types/UserOptions'
const info = debug('gotql:info')

/**
 * Performs a mutation on the specified GraphQL endpoint
 *
 * @param {string} endPoint GraphQL Endpoint
 * @param {queryType} query The JSON getQL query object
 * @param {userOpts} [options] User options
 * @public
 * @return {Promise<any>} A response object containing all the data
 */
export function mutation (endPoint: string, query: QueryType, options?: UserOptions): Promise<any> {
  info('Starting a new mutation')
  return run(endPoint, query, GotQL.ExecutionType.MUTATION, got, options)
}
