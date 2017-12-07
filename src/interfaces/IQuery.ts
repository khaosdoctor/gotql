import IArgs from "./IArgs";
import IVars from "./IVars";
import IFields from "./IField";
import IOperation from "./IOperation";

export default interface IQuery {
  readonly name?: string;
  readonly operation: string|IOperation;
  args?: IArgs;
  variables?: IVars;
  fields: IFields;
}
