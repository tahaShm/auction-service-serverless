import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // ES Modules import
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export async function getEndedAuctions() {
    const now = new Date();

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: "statusAndEndDate",
        KeyConditionExpression: "#status = :status AND endingAt < :now", // query in dynamoDB
        ExpressionAttributeValues: {
            ":status": "OPEN",
            ":now": now.toISOString(),
        },
        ExpressionAttributeNames: {
            "#status": "status", // when you have a reserved keyword you need to use the # prefix
        },
    };
    const command = new QueryCommand(params);

    const results = await docClient.send(command);
    return results.Items; // we do error handling in one level higher
}
