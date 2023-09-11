import OpulenceEarn from "../../models/OpulenceEarn"
import { XummJsonTransaction, XummPostPayloadBodyJson } from 'xumm-sdk/dist/src/types';
import requestXummTransaction from "../../utils/xumm-utils"
import { BURN_ADDRESS, BURN_AMOUNT, XRPL_CURRENCY_LIST } from "../../config";

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
const registerOpulenceEarn = async (account: string, user_token: string) => {
  if (!account) {
    return {
      status: "failed",
      data: "Please provide a account address!"
    };
  }

  if (!user_token) {
    return {
      status: "failed",
      data: "Please provide a user_token!"
    };
  }

  const walletAddress = account;
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
    Account: account,
    Destination: BURN_ADDRESS,
    Amount: {
      value: `${BURN_AMOUNT}`,
      currency: opulenceToken.currency.currency,
      issuer: opulenceToken.currency.issuer
    },
  };

  const data = {
    txjson: txjson,
    user_token,
  };

  /**
   * insert staker's walletAddress to database
   * @returns {void}
   */
  const createStaker = async () => {
    await OpulenceEarn.create({
      walletAddress
    });
  }

  const result = await requestXummTransaction(data, createStaker);
  
  return result;
};

export default registerOpulenceEarn;
