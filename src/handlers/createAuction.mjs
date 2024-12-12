import { v4 as uuid } from "uuid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import
// const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb"); // CommonJS import
const client = new DynamoDBClient();

async function createAuction(event, context) {
    const { title } = JSON.parse(event.body);
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

    await client.send(command);

    return {
        statusCode: 201, // resource created
        body: JSON.stringify(auction),
    };
}

export const handler = createAuction;
