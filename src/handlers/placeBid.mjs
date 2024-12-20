import { DynamoDBClient, ReturnValue } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import mutateMiddleware from "../lib/mutateMiddleware.mjs";
import createError from "http-errors";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

async function placeBid(event, context) {
    const { id } = event.pathParameters;
    const { amount } = event.body;

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: {
            id,
        },
        UpdateExpression: "SET highestBid.amount = :amount",
        ExpressionAttributeValues: {
            ":amount": amount,
        },
        ReturnValues: "ALL_NEW",
    };

    let updatedAuction;

    try {
        const command = new UpdateCommand(params);
        const result = await docClient.send(command);

        updatedAuction = result.Attributes;
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }

    if (!updatedAuction) {
        throw new createError.NotFound(`Auction with id ${id} not found`);
    }

    return {
        statusCode: 200,
        body: JSON.stringify(auction),
    };
}

export const handler = mutateMiddleware(placeBid);
