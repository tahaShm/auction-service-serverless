import { getEndedAuctions } from "../lib/getEndedAuctions.mjs";

async function processAuctions(event, context) {
    const auctionsToClose = await getEndedAuctions();
    console.log("Auctions to close: ", auctionsToClose);
}

export const handler = processAuctions;
