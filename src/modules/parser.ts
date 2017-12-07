import IQuery from "../interfaces/IQuery";
import QueryType from "../interfaces/EType";

function parse (query: IQuery, type: QueryType) : string {
  let finalQuery:string = `${type.toString()}`;
  finalQuery.concat(query.name || "", " {"); // Append query name if the name is present
  finalQuery.concat(query.operation); // Append operation name


  return finalQuery
}

export default { parse };
