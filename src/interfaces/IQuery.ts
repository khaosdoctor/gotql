import IArgs from "./IArgs";
import IVars from "./IVars";
import IFields from "./IField";

export default interface IQuery {
  readonly name?: string;
  args?: IArgs;
  variables?: IVars;
  fields: IFields;
}
