import { XummJsonTransaction } from "xumm-sdk/dist/src/types";
import { BURN_ADDRESS, BURN_AMOUNT_1000, XRPL_CURRENCY_LIST } from "../../config";
import OpulenceFaucet from "../../models/OpulenceFaucet"
import requestXummTransaction from "../../utils/xumm-utils";

const createOpulenceFaucet = async (walletAddress: string, user_token: string) => {
  if (!walletAddress) {
    return {
      status: "failed",
      data: "Please provide a account address!"
    };
  }

  if (!user_token) {
    return {
      status: "failed",
      data: "Please provide a user_token!"
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

  const opulenceToken = XRPL_CURRENCY_LIST[0];

  const txjson: XummJsonTransaction = {
    TransactionType: "Payment",
    Account: walletAddress,
    Destination: BURN_ADDRESS,
    Amount: {
      value: `${BURN_AMOUNT_1000}`,
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

export default createOpulenceFaucet;
