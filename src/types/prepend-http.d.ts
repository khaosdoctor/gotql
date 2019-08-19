declare module 'prepend-http' {
  function prependHttp (url: string, options?: { https: boolean }): string
  export = prependHttp
}


