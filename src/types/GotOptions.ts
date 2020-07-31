import { GotQL } from './generics'

export type GotOptions = {
  headers?: Record<string, string>
  json: {
    query: string
    operationName: GotQL.Nullable<string>
    variables: GotQL.Nullable<Record<string, string>>
  }
}
