import * as got from "got";
import IOptions from "./interfaces/IOptions";
import IQuery from "./interfaces/IQuery";
import parser from "./modules/parser";
import Logger from "./modules/logger";
import QueryType from "./interfaces/EType";

function query (endPoint: string, query: IQuery, options: IOptions) {
  try {
    const logger: Logger = new Logger(options); // Instantiate logger to log messages

    logger.log(`Parsing query: ${query}`);
    const graphQuery: string = parser.parse(query, QueryType.query);
    logger.log(`Parsed query: ${graphQuery}`);

    logger.log('Building options object');
    const httpOptions: object = {
      headers: options.headers,
      body: graphQuery,
      json: true
    }
    logger.log(`Option object: ${httpOptions}`);

    return got.post(endPoint, httpOptions);
  } catch (error) {
    throw error;
  }
};

export default query;
