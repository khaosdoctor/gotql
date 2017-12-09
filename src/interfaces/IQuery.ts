import IArgs from "./IArgs";
import IVars from "./IVars";
import IFields from "./IField";

export default interface IQuery {
  readonly name?: string;
  readonly operation: {
    name: string;
    args?: IArgs
    fields: IFields;
  };
  args?: IArgs;
  variables?: IVars;
}
