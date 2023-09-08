import prisma from "../../prisma/prisma-client";
import OpulenceStaker from "../models/OpulenceStaker"
import { XummJsonTransaction, XummPostPayloadBodyJson } from 'xumm-sdk/dist/src/types';
import requestXummTransaction from "../utils/xumm-utils"

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

  const createStaker = async () => {
    const staker = await OpulenceStaker.create({
      walletAddress
    });
  }

  const result = await requestXummTransaction(data, createStaker);
  
  return result;
};

export default registerOpulenceStaker;
