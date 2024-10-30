//Globals
import { responseBuilder, requestHeaderValidator, CustomException } from "@cny-src/serverless.aws.lambda/validator";
import { deleteItem } from "@cny-src/serverless.aws.lambda/db";
import schema from "./inputs/schema/schema";
import responseTypes from "./responseTypes";
import { withMiddleware } from "./middleware";

const { DEFAULT_DYNAMODB_TABLE_NAME, STAGE } = process.env;
const SK_PREFIX = "";
const PK_CONSTANT = "";

let method;

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

     let response = await deleteItem({ TableName, pk: PK_CONSTANT, sk: SK_PREFIX });

     if (response.message === "ConditionalCheckFailedException") {
          throw new CustomException({ ...responseTypes.NOT_FOUND, method });
     }

     if (response.error) {
          throw new CustomException({ ...responseTypes.DATABASE_ERROR, data: response.error, method });
     }

     return;
};

export const handler = withMiddleware(myHandler, responseTypes);
