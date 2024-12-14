import {
    DynamoDBClient,
    UpdateItemCommand,
    ReturnValue,
} from "@aws-sdk/client-dynamodb"; // ES Modules import
import mutateMiddleware from "../lib/mutateMiddleware.mjs";
import createError from "http-errors";

const client = new DynamoDBClient();

async function placeBid(event, context) {
    const { id } = event.pathParameters;
    const { amount } = event.body;

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: {
            id: { S: id },
        },
        UpdateExpression: "SET highestBid.amount = :amount",
        ExpressionAttributeValues: {
            ":amount": { N: `${amount}` },
        },
        ReturnValues: "ALL_NEW",
    };

    let updatedAuction;

    try {
        const command = new UpdateItemCommand(params);
        const result = await client.send(command);
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
