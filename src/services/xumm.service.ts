import prisma from "../../prisma/prisma-client";
import OpulenceStaker from "../models/OpulenceStaker"
import { XummJsonTransaction, XummPostPayloadBodyJson } from 'xumm-sdk/dist/src/types';
import requestXummTransaction from "../utils/xumm-utils"

/**
 * Create a payload and subscribe it for a general XUMM transaction without updating the database,
 * and return the status and response.
 * Called when receiving a POST request via /api/xumm.
 * 
 * @param {XummJsonTransaction} txjson - The XUMM JSON transaction object
 * @param {string} [user_token] - Optional user token
 * @returns {Object} - Returns an object with status and data properties
 *                    `status` can be "success", "signed", "failed", or "rejected"
 *                    `data` represents the response
 */
const runXummTransaction = async (txjson: XummJsonTransaction, user_token?: string) => {
  if (!txjson) {
    return {
      status: "failed",
      data: "Please provide a txjson!"
    };
  }

  const data = {
    txjson: txjson,
    user_token,
  };

  const result = await requestXummTransaction(data);
  
  return result;
};

export default runXummTransaction;
