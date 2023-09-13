import OpulenceEarn from "../../models/OpulenceEarn"
import { XummJsonTransaction, XummPostPayloadBodyJson } from 'xumm-sdk/dist/src/types';
import { requestXummTransaction } from "../../utils/xumm-utils"
import { XRPL_CURRENCY_LIST } from "../../config";
import { validateUser } from "../validators/userValidator";

/**
 * Create a payload, subscribe it, save the staker's walletAddress to the database after the user signs,
 * and return the status and response.
 * Called when receiving a POST request via /api/OPLStaking.
 *
 * @param {XummJsonTransaction} txjson - The XUMM JSON transaction object
 * @param {string} user_token - The user token
 * @returns {Object} - Returns an object with status and data properties
 *                    `status` can be "success", "signed", "failed", or "rejected"
 *                    `data` represents the response
 */
export const createOpulenceEarn = async (walletAddress: string, user_token: string) => {
  const { status, data } = await validateUser(walletAddress, user_token);
  if(status === "failed") {
    return { status, data };
  }
  
  const OPLReward = await OpulenceEarn.findOne({
    walletAddress,
  });
  if (OPLReward) {
    return {
      status: "failed",
      data: "User already registered!"
    };
  }

  const opulenceToken = XRPL_CURRENCY_LIST[0];

  const txjson: XummJsonTransaction = {
    TransactionType: "Payment",
    Account: walletAddress,
    Destination: process.env.BURN_ADDRESS,
    Amount: {
      value: `${process.env.BURN_AMOUNT_2000}`,
      currency: opulenceToken.currency.currency,
      issuer: opulenceToken.currency.issuer
    },
  };

  const payload = {
    txjson: txjson,
    user_token,
  };

  /**
   * insert staker's walletAddress to database
   * @returns {void}
   */
  const callback = async () => {
    await OpulenceEarn.create({
      walletAddress
    });
  }

  const result = await requestXummTransaction(payload, callback);
  
  return result;
};
