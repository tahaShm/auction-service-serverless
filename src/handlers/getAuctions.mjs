import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware.mjs";

const client = new DynamoDBClient();

async function getAuctions(event, context) {
    let auctions;

    try {
        const command = new ScanCommand({
            TableName: process.env.AUCTIONS_TABLE_NAME,
        });
        const results = await client.send(command);

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
