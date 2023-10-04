import { XummJsonTransaction } from "xumm-sdk/dist/src/types";
import { requestTransactionAndGetMessage } from "../../utils/xumm-utils";
import { XRPL_CURRENCY_LIST } from "../../config";
import { getOPXRate } from "../../utils/xrpl-utils";

let requestCreateOfferCount = 0;
const requestLimit = 20;
let startTime = new Date().getTime();

/**
 * Create a offer to buy OPX and return the status and response.
 * Called when receiving a POST request via /api/buyToken and will be limited below 20 requests per minute.
 *
 * @param {string} user_token - The user token
 * @returns {Object} - Returns an object with status and data properties
 *                    `status` can be "success", "signed", "failed", or "rejected"
 *                    `data` represents the response
 */
export const createOffer = async (user_token?: string, amount?: number) => {
  const currentTime = new Date().getTime();
  if (currentTime - startTime > 60) {
    requestCreateOfferCount = 0;
  } else {
    requestCreateOfferCount++;
    if (requestCreateOfferCount > requestLimit)
      throw "The request limit has been reached. Please wait a moment and retry.";
  }
  const opulenceToken = XRPL_CURRENCY_LIST[0];
  const rate = await getOPXRate();

  const txjson: XummJsonTransaction = {
    TransactionType: "OfferCreate",
    TakerPays: {
      currency: opulenceToken.currency.currency,
      issuer: opulenceToken.currency.issuer,
      value: amount.toString(),
    },
    TakerGets: Math.floor(((amount / rate) * 103) / 100).toString(),
    Flags: "655360",
    Fee: "12",
  };

  const payload = {
    txjson: txjson,
    user_token,
  };

  const result = await requestTransactionAndGetMessage(payload);

  return result;
};
