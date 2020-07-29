import { GotQL } from "./generics";

export type GotJSONOptions = {
  headers?: { [s: string]: string }
  json: {
    query: string
    operationName: string | null
    variables: GotQL.Dictionary<string> | null
  }
}
