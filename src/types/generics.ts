export namespace GotQL {
  export type Dictionary<Y> = { [key: string]: Y }

  export enum ExecutionType {
    QUERY = 'query',
    MUTATION = 'mutation'
  }

  export type Response = {
    data: object
    statusCode: number
    message: string
  }
}
