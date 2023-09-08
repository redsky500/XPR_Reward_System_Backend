import prisma from "../../prisma/prisma-client";
import OpulenceStaker from "../models/OpulenceStaker"
import { XummJsonTransaction, XummPostPayloadBodyJson } from 'xumm-sdk/dist/src/types';
import requestXummTransaction from "../utils/xumm-utils"

const registerOpulenceStaker = async (txjson: XummJsonTransaction, user_token?: string) => {
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

export default registerOpulenceStaker;
