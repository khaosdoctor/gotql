export default interface IOptions {
  debug?: boolean;
  headers?: {
    [headerName: string]: string;
  }
}
