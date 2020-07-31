export namespace GotQL {
  export type Nullable<T> = T | null
  export enum ExecutionType {
    QUERY = 'query',
    MUTATION = 'mutation'
  }

  export type Response = {
    data: object
    statusCode: number
    message: string
    endpoint: string
    options: string
  }
}
