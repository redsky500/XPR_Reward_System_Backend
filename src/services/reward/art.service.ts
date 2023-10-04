import { XummJsonTransaction } from "xumm-sdk/dist/src/types";
import { XRPL_CURRENCY_LIST } from "../../config";
import OpulenceArt from "../../models/OpulenceArt"
import { requestTransactionAndGetResolve, readPayloadResponse } from "../../utils/xumm-utils";
import { getClient, isRegisterableArt } from "../../utils/xrpl-utils";
import { validateUser } from "../validators/userValidator";

export const createOpulenceArt = async (walletAddress: string, user_token: string) => {
  const { status, data } = await validateUser(walletAddress, user_token);
  if(status === "failed") {
    return { status, data };
  }

  const OPLReward = await OpulenceArt.findOne({
    walletAddress,
  });
  if (OPLReward) {
    return {
      status: "failed",
      data: "User already registered!"
    };
  }

  const client = await getClient();
  
  await isRegisterableArt(client, walletAddress);
  await client.disconnect();
  
  const opulenceToken = XRPL_CURRENCY_LIST[0];
  
  const burnAmount = process.env.BURN_AMOUNT_1000;
  if (!(Number(burnAmount) > 0)) {
    return {
      status: "failed",
      data: "Zero is invalid value for payment."
    };
  }
  const txjson: XummJsonTransaction = {
    TransactionType: "Payment",
    Account: walletAddress,
    Destination: process.env.BURN_ADDRESS,
    Amount: {
      value: burnAmount,
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
  const callback = async () => (
    await OpulenceArt.create({
      walletAddress
    })
  );

  const payloadResponse = await requestTransactionAndGetResolve(payload);
  const result = await readPayloadResponse(payloadResponse, callback);
  
  return result;
};
