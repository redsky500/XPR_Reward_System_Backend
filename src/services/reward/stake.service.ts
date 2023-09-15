import { XummJsonTransaction } from "xumm-sdk/dist/src/types";
import { XRPL_CURRENCY_LIST } from "../../config";
import OpulenceStake from "../../models/OpulenceStake"
import { requestXummTransaction, requestVerifyUserToken, validateAccount } from "../../utils/xumm-utils";
import { getBalances, getClient, getStakeWallet, isRegisterable, requestXrpTransaction } from "../../utils/xrpl-utils";
import { Transaction, TransactionMetadata } from "xrpl";
import { validateUser } from "../validators/userValidator";

export const createOpulenceStake = async (walletAddress: string, user_token: string) => {
  const { status, data } = await validateUser(walletAddress, user_token);
  if(status === "failed") {
    return { status, data };
  }

  const OPLReward = await OpulenceStake.findOne({
    walletAddress,
  });
  if (OPLReward) {
    return {
      status: "failed",
      data: "User already registered!"
    };
  }

  const client = getClient();
  await client.connect();

  const registerable = await isRegisterable(client, walletAddress);
  await client.disconnect();
  if (!registerable) {
    return {
      status: "failed",
      data: "Not enough balance! Please check the conditions."
    };
  }

  const opulenceToken = XRPL_CURRENCY_LIST[0];

  const txjson: XummJsonTransaction = {
    TransactionType: "Payment",
    Account: walletAddress,
    Destination: process.env.BURN_ADDRESS,
    Amount: {
      value: `${process.env.BURN_AMOUNT_1000}`,
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
    await OpulenceStake.create({
      walletAddress
    })
  );

  const result = await requestXummTransaction(payload, callback);
  
  return result;
};
