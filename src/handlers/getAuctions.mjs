import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware.mjs";
import getAuctionsSchema from "../lib/schemas/getAuctionsSchema.mjs";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

async function getAuctions(event, context) {
    const { status } = event.queryStringParameters;

    let auctions;

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: "statusAndEndDate",
        KeyConditionExpression: "#status = :status", // query in dynamoDB
        ExpressionAttributeValues: {
            ":status": status,
        },
        ExpressionAttributeNames: {
            "#status": "status", // when you have a reserved keyword you need to use the # prefix
        },
    };

    try {
        const command = new QueryCommand(params);
        const results = await docClient.send(command);

        auctions = results.Items;
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error); // this is for debugging case only. in practice, you don't want to expose internal errors to the end users
    }

    return {
        statusCode: 200,
        body: JSON.stringify(auctions),
    };
}

export const handler = commonMiddleware(getAuctions).use(
    validator({
        eventSchema: transpileSchema(getAuctionsSchema),
        ajvOptions: { strict: false, useDefaults: true },
    })
);
