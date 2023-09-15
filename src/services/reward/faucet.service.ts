import { XummJsonTransaction } from "xumm-sdk/dist/src/types";
import { XRPL_CURRENCY_LIST } from "../../config";
import OpulenceFaucet from "../../models/OpulenceFaucet"
import { requestXummTransaction, requestVerifyUserToken, validateAccount } from "../../utils/xumm-utils";
import { getBalances, getClient, getFaucetWallet, isRegisterable, requestXrpTransaction } from "../../utils/xrpl-utils";
import { Transaction, TransactionMetadata } from "xrpl";
import { validateUser } from "../validators/userValidator";

export const createOpulenceFaucet = async (walletAddress: string, user_token: string) => {
  const { status, data } = await validateUser(walletAddress, user_token);
  if(status === "failed") {
    return { status, data };
  }

  const OPLReward = await OpulenceFaucet.findOne({
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
    await OpulenceFaucet.create({
      walletAddress
    })
  );

  const result = await requestXummTransaction(payload, callback);
  
  return result;
};

export const claimFaucet = async (walletAddress: string, user_token: string) => {
  const { status, data } = await validateUser(walletAddress, user_token);
  if(status === "failed") {
    return { status, data };
  }
  
  const OPLReward = await OpulenceFaucet.findOne({
    walletAddress,
  });
  if (!OPLReward) {
    return {
      status: "failed",
      data: "User is not registered!"
    };
  }

  const reward = OPLReward.reward;
  if (!(reward > 0)) {
    return {
      status: "failed",
      data: "No claimable amount!"
    };
  }

  if (!(await validateAccount(walletAddress, user_token))) {
    return {
      status: "failed",
      data: "Not the account's owner!"
    };
  }

  const client = getClient();
  await client.connect();
  
  const registerable = await isRegisterable(client, walletAddress);
  if (!registerable) {
    return {
      status: "failed",
      data: "Not enough balance! Please check the conditions."
    };
  }

  const wallet = getFaucetWallet();
  const txjson = {
    TransactionType: "Payment",
    Account: wallet.classicAddress,
    Amount: `${reward}`,
    Destination: OPLReward.walletAddress,
  };
  const { result } = await requestXrpTransaction(client, wallet, txjson);

  await client.disconnect();

  const txMeta = result.meta as TransactionMetadata;
  if(txMeta?.TransactionResult !== "tesSUCCESS") {
    return {
      status: "failed",
      data: "Something went wrong!"
    };
  }

  await OPLReward.updateOne({
    reward: 0,
  });

  return {
    status: "success",
    data: {
      response: {
        txid: result.hash,
        dispatched_result: txMeta?.TransactionResult,
      }
    },
  };
};
