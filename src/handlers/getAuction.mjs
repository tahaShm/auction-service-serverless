import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";

import commonMiddleware from "../lib/commonMiddleware.mjs";


const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export async function getAuctionById(id) {
    let auction;

    try {
        const command = new GetCommand({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Key: {
                id,
            },
        });

        const result = await docClient.send(command);

        auction = result.Item;
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error); // this is for debugging case only. in practice, you don't want to expose internal errors to the end users
    }

    if (!auction) {
        throw new createError.NotFound(`Auction with id ${id} not found`);
    }

    return auction;
}

async function getAuction(event, context) {
    const { id } = event.pathParameters;
    const auction = await getAuctionById(id);

    return {
        statusCode: 200,
        body: JSON.stringify(auction),
    };
}

export const handler = commonMiddleware(getAuction);
