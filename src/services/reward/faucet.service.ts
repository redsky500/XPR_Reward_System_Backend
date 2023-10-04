import { XummPostPayloadBodyJson } from "xumm-sdk/dist/src/types";
import { XRPL_CURRENCY_LIST } from "../../config";
import OpulenceFaucet from "../../models/OpulenceFaucet";
import {
  requestTransactionAndGetResolve,
  readPayloadResponse,
  validateAccount,
} from "../../utils/xumm-utils";
import {
  getClient,
  getFaucetWallet,
  isRegisterableFaucetOrStake,
  requestXrpTransaction,
} from "../../utils/xrpl-utils";
import { TransactionMetadata } from "xrpl";
import { validateUser } from "../validators/userValidator";

export const createOpulenceFaucet = async (
  walletAddress: string,
  user_token: string
) => {
  const { status, data } = await validateUser(walletAddress, user_token);
  if (status === "failed") {
    return { status, data };
  }
  const OPLReward = await OpulenceFaucet.findOne({
    walletAddress,
  });
  if (OPLReward) throw "User already registered!";
  const client = await getClient();

  await isRegisterableFaucetOrStake(client, walletAddress);
  await client.disconnect();
  const opulenceToken = XRPL_CURRENCY_LIST[0];

  const burnAmount = process.env.BURN_AMOUNT_1000;
  if (!(Number(burnAmount) > 0)) {
    return {
      status: "failed",
      data: "Zero is invalid value for payment.",
    };
  }
  const payload: XummPostPayloadBodyJson = {
    txjson: {
      TransactionType: "Payment",
      Account: walletAddress,
      Destination: process.env.BURN_ADDRESS,
      Amount: {
        value: burnAmount,
        currency: opulenceToken.currency.currency,
        issuer: opulenceToken.currency.issuer,
      },
    },
    user_token,
  };
  const callback = async () => {
    await OpulenceFaucet.create({
      walletAddress,
    });
  };
  const payloadResponse = await requestTransactionAndGetResolve(payload);
  const result = await readPayloadResponse(payloadResponse, callback);
  return result;
};

export const claimFaucet = async (
  walletAddress: string,
  user_token: string
) => {
  const { status, data } = await validateUser(walletAddress, user_token);
  if (status === "failed") throw data;
  if (!(await validateAccount(walletAddress, user_token)))
    throw "Not the account's owner!";
  const OPLReward = await OpulenceFaucet.findOneAndUpdate(
    { walletAddress,
      $or: [
        { lastUpdated: { $lt: new Date().setHours(0, 0, 0, 0) } },
        { lastUpdated: { $exists: false } },
      ], },
    { reward: 0 }
  );
  if (!OPLReward) throw "User is not registered!";
  const reward = OPLReward.reward;
  if (!(reward > 0)) {
    return {
      status: "failed",
      data: "No claimable amount!",
    };
  }

  const client = await getClient();

  await isRegisterableFaucetOrStake(client, walletAddress);

  const wallet = getFaucetWallet();
  const txjson = {
    TransactionType: "Payment",
    Account: wallet.classicAddress,
    Amount: reward.toString(),
    Destination: OPLReward.walletAddress,
  };
  const { result } = await requestXrpTransaction(client, wallet, txjson);
  await client.disconnect();
  const txMeta = result.meta as TransactionMetadata;
  return {
    status: "success",
    data: {
      response: {
        txid: result.hash,
        dispatched_result: txMeta?.TransactionResult,
      },
    },
  };
};
