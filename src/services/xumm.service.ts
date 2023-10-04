import { XummJsonTransaction } from 'xumm-sdk/dist/src/types';
import { requestTransactionAndGetResolve, readPayloadResponse, subscribeTransaction, readPayloadResponseForConnect } from "../utils/xumm-utils";

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

  const payload = {
    txjson: txjson,
    user_token,
  };
  const payloadResponse = await requestTransactionAndGetResolve(payload);
  const result = await readPayloadResponse(payloadResponse);
  
  return result;
};

/**
 * Subscribe a created offer and return the status and response.
 * Called when receiving a POST request via /api/buyTokenSubscribe.
 *
 * @param {string} uuid - The user token
 * @returns {Object} - Returns an object with status and data properties
 *                    `status` can be "success", "signed", "failed", or "rejected"
 *                    `data` represents the response
 */
export const subscribe = async (uuid?: string) => {
  const payloadResponse = await subscribeTransaction(uuid);
  const result = await readPayloadResponse(payloadResponse);
  
  return result;
};

/**
 * Subscribe a created offer and return the status and response.
 * Called when receiving a POST request via /api/buyTokenSubscribe.
 *
 * @param {string} uuid - The user token
 * @returns {Object} - Returns an object with status and data properties
 *                    `status` can be "success", "signed", "failed", or "rejected"
 *                    `data` represents the response
 */
export const subscribeForConnect = async (uuid?: string) => {
  const payloadResponse = await subscribeTransaction(uuid);
  const result = await readPayloadResponseForConnect(payloadResponse);
  
  return result;
};

export default runXummTransaction;
