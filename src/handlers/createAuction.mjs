import { v4 as uuid } from "uuid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
// const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb"); // CommonJS import
import httpJsonBodyParser from "@middy/http-json-body-parser";
import mutateMiddleware from "../lib/mutateMiddleware.mjs";
import createError from "http-errors";

const client = new DynamoDBClient();

async function createAuction(event, context) {
    const { title } = event.body; // removed JSON.parse() as it's not needed with the httpJsonBodyParser() middleware
    const now = new Date();

    const auction = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: {
            id: { S: uuid() },
            title: { S: title },
            status: { S: "OPEN" },
            createdAt: { S: now.toISOString() },
            highestBid: { M: { amount: { N: "0" } } },
        },
    };

    const command = new PutItemCommand(auction);

    try {
        await client.send(command);
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error); // reduces the overhead of creating a new error for each type of error
    }

    return {
        statusCode: 201, // resource created
        body: JSON.stringify(auction),
    };
}

export const handler = mutateMiddleware(createAuction);
