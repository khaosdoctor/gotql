import IArgs from "./IArgs";

export default interface IFields {
  [fieldName: string]: {
   alias?: string;
   args?: IArgs;
   fields?: IFields;
  }
}
