import got from "got";
import IOptions from "./interfaces/IOptions";
import IQuery from "./interfaces/IQuery";
import parser from "./modules/parser";
import Logger from "./modules/logger";
import QueryType from "./interfaces/EType";

async function query (endPoint: string, query: IQuery, options: IOptions) {
  try {
    const logger: Logger = new Logger(options); // Instantiate logger to log messages

    logger.log(`Parsing query: ${query}`);
    const graphQuery: string = parser.parse(query, QueryType.query);
    logger.log(`Parsed query: ${graphQuery}`);

    logger.log('Building options object');
    const httpOptions: object = {
      headers: options.headers,
      body: {
        query: graphQuery,
        operationName: query.name || null,
        variables: query.variables || null
      },
      json: true
    }
    logger.log(`Option object: ${httpOptions}`);

    let response = await got.post(endPoint, httpOptions);

    if (response.body['errors']) {
      logger.log(`Detected response error`)
      response.statusCode = 500
    }

    logger.log('Retrieved response:')
    logger.log(JSON.stringify(response))
    return response
  } catch (error) {
    throw error;
  }
};

export default query;
