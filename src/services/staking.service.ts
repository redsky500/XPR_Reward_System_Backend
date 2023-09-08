import prisma from "../../prisma/prisma-client";
import OpulenceStaker from "../models/OpulenceStaker"
import { XummJsonTransaction, XummPostPayloadBodyJson } from 'xumm-sdk/dist/src/types';
import requestXummTransaction from "../utils/xumm-utils"

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
const registerOpulenceStaker = async (txjson: XummJsonTransaction, user_token: string) => {
  if (!txjson) {
    return {
      status: "failed",
      data: "Please provide a txjson!"
    };
  }

  if (!user_token) {
    return {
      status: "failed",
      data: "Please provide a user_token!"
    };
  }

  const walletAddress = txjson.Account as string;
  const OPLReward = await OpulenceStaker.findOne({
    walletAddress,
  });
  if (OPLReward) {
    return {
      status: "failed",
      data: "User already registered!"
    };
  }

  const data = {
    txjson: txjson,
    user_token,
  };

  /**
   * insert staker's walletAddress to database
   * @returns {void}
   */
  const createStaker = async () => {
    const staker = await OpulenceStaker.create({
      walletAddress
    });
  }

  const result = await requestXummTransaction(data, createStaker);
  
  return result;
};

export default registerOpulenceStaker;
