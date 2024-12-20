import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import commonMiddleware from "../lib/commonMiddleware.mjs";
import createError from "http-errors";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

async function getAuction(event, context) {
    let auction;
    const { id } = event.pathParameters;

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

    return {
        statusCode: 200,
        body: JSON.stringify(auction),
    };
}

export const handler = commonMiddleware(getAuction);
