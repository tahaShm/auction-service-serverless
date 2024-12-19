import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware.mjs";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

async function getAuctions(event, context) {
    let auctions;

    try {
        const command = new ScanCommand({
            TableName: process.env.AUCTIONS_TABLE_NAME,
        });
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

export const handler = commonMiddleware(getAuctions);
