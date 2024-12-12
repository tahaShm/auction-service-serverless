import { v4 as uuid } from "uuid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
// const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb"); // CommonJS import
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";

const client = new DynamoDBClient();

async function createAuction(event, context) {
    const { title } = event.body; // removed JSON.parse() as it's not needed with the httpJsonBodyParser() middleware
    const now = new Date();

    const auction = {
        id: uuid(),
        title,
        status: "OPEN",
        createdAt: now.toISOString(),
    };

    const command = new PutItemCommand({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: {
            id: { S: auction.id },
            title: { S: auction.title },
            status: { S: auction.status },
            createdAt: { S: auction.createdAt },
        },
    });

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

export const handler = middy(createAuction)
    .use(httpJsonBodyParser())
    .use(httpEventNormalizer())
    .use(httpErrorHandler());
