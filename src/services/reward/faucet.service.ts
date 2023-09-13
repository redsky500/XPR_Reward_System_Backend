import { XummJsonTransaction } from "xumm-sdk/dist/src/types";
import { XRPL_CURRENCY_LIST } from "../../config";
import OpulenceFaucet from "../../models/OpulenceFaucet"
import { requestXummTransaction, requestVerifyUserToken, validateUser } from "../../utils/xumm-utils";
import { getBalances, getClient, getPrepared, getFaucetWallet, isRegisterableFaucet, submitAndWait } from "../../utils/xrpl-utils";
import { Transaction, TransactionMetadata } from "xrpl";

export const createOpulenceFaucet = async (walletAddress: string, user_token: string) => {
  if (!walletAddress) {
    return {
      status: "failed",
      data: "Please provide a account address!"
    };
  }

  if (!user_token) {
    return {
      status: "failed",
      data: "Please connect wallet first!"
    };
  }

  if (!(await requestVerifyUserToken(user_token))) {
    return {
      status: "failed",
      data: "Invalid user token!"
    };
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

  const registerable = await isRegisterableFaucet(client, walletAddress);
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

  const data = {
    txjson: txjson,
    user_token,
  };

  /**
   * insert staker's walletAddress to database
   * @returns {void}
   */
  const callback = async () => {
    await OpulenceFaucet.create({
      walletAddress
    });
  }

  const result = await requestXummTransaction(data, callback);
  
  return result;
};

export const claimFaucet = async (walletAddress: string, user_token: string) => {
  if (!walletAddress) {
    return {
      status: "failed",
      data: "Please provide a account address!"
    };
  }

  if (!user_token) {
    return {
      status: "failed",
      data: "Please connect wallet first!"
    };
  }

  if (!(await requestVerifyUserToken(user_token))) {
    return {
      status: "failed",
      data: "Invalid user token!"
    };
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

  if (!(await validateUser(walletAddress, user_token))) {
    return {
      status: "failed",
      data: "Invalid User!"
    };
  }
  
  const client = getClient();
  await client.connect();

  const wallet = getFaucetWallet();
  const txjson = {
    TransactionType: "Payment",
    Account: wallet.classicAddress,
    Amount: `${reward}`,
    Destination: OPLReward.walletAddress,
  };
  const prepared: Transaction = await getPrepared(client, txjson);

  const signed = wallet.sign(prepared as Transaction);
  const { result } = await submitAndWait(client, signed.tx_blob);
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
    data: `Congratulation! You claimed ${reward} xrp successfully.`,
  };
};
