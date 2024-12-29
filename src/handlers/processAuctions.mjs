import createError from "http-errors";
import { getEndedAuctions } from "../lib/getEndedAuctions.mjs";
import { closeAuction } from "../lib/closeAuction.mjs";

async function processAuctions(event, context) {
    try {
        const auctionsToClose = await getEndedAuctions();
        const closePromises = auctionsToClose.map((auction) =>
            closeAuction(auction)
        );
        await Promise.all(closePromises);

        return {
            closed: closePromises.length,
        }; // as this method is not called with api gateway, we don't need to return a response in http format
    } catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }
}

export const handler = processAuctions;
