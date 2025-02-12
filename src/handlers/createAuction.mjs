import { v4 as uuid } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
// const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb"); // CommonJS import
import createError from "http-errors";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";

import mutateMiddleware from "../lib/mutateMiddleware.mjs";
import createAuctionSchema from "../lib/schemas/createAuctionSchema.mjs";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

async function createAuction(event, context) {
    const { title } = event.body; // removed JSON.parse() as it's not needed with the httpJsonBodyParser() middleware
    const { email } = event.requestContext.authorizer;
    const now = new Date();
    const endDate = new Date();
    endDate.setHours(now.getHours() + 1); // add 1 hour

    const auction = {
        id: uuid(),
        title,
        status: "OPEN",
        createdAt: now.toISOString(),
        endingAt: endDate.toISOString(),
        highestBid: { amount: 0 },
        seller: email,
    };

    try {
        const command = new PutCommand({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Item: auction,
        });

        await docClient.send(command);
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error); // reduces the overhead of creating a new error for each type of error
    }

    return {
        statusCode: 201, // resource created
        body: JSON.stringify(auction),
    };
}

export const handler = mutateMiddleware(createAuction).use(
    validator({
        eventSchema: transpileSchema(createAuctionSchema),
    })
);
