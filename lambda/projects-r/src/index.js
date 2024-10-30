//Globals
import responseTypes from "./responseTypes";
import schema from "./inputs/schema/schema";
import { responseBuilder, requestHeaderValidator, CustomException } from "@cny-src/serverless.aws.lambda/validator";
import { readSingleItem } from "@cny-src/serverless.aws.lambda/db";
import { withMiddleware } from "./middleware";

const { DEFAULT_DYNAMODB_TABLE_NAME, STAGE } = process.env;
let method;
const SK_PREFIX = "";
const PK_CONSTANT = "";

export const myHandler = async (event) => {
     method = event.requestContext.http.method;
     console.log(event);
     const response = await dispatcher(event, method);

     return responseBuilder(responseTypes.REQUEST_SUCCESS, { data: response }, method);
};

const dispatcher = async (request, method) => {
     let { headers } = request;

     headers = await requestHeaderValidator({ headers, method, schema, responseTypes });

     const TableName = DEFAULT_DYNAMODB_TABLE_NAME;

     let data;

     const response = await readSingleItem({
          TableName,
          pk: `${PK_CONSTANT}`,
          sk: `${SK_PREFIX}`,
     });

     if (response.error) {
          throw new CustomException({ ...responseTypes.DATABASE_ERROR, data: response.error, method });
     }

     if (!response.Item) {
          data = {};
     } else {
          console.log(data);
          data = response.Item.data;
     }

     return data;
};

export const handler = withMiddleware(myHandler, responseTypes);
