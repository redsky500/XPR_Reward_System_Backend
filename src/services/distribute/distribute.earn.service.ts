import { getAllDataByFilter } from "../../utils/utils";
import { OPUL_REWARD_MAX_PERCENT, XRPL_CURRENCY_LIST } from "../../config";
import OpulenceEarn from "../../models/OpulenceEarn";
import {
  getBalanceOfOpulence,
  getClient,
  getEarnWallet,
  getMultipleBalances,
  requestXrpTransaction,
} from "../../utils/xrpl-utils";

type Balance = {
  account: string;
  balance: number;
};

const opulenceToken = XRPL_CURRENCY_LIST[0];
const dailyReward = parseFloat(process.env.POOL_AMOUNT) / 365;

/**
 * Fetch all stakers from the database, get their opulence balance, and return an array of the data.
 *
 * @param {object} client - XRPL Client object
 * @returns {Array} - Returns an array of staker data
 */
async function fetchBalanceDataForEarn() {
  const stakers = await getAllDataByFilter(OpulenceEarn);
  const accounts = stakers.map((staker) => staker.walletAddress);

  const OPULENCE_CURRENCY = XRPL_CURRENCY_LIST[0].currency;
  const accountBalances = await getMultipleBalances(
    accounts,
    OPULENCE_CURRENCY
  );
  const result = Object.keys(accountBalances).reduce(
    (prev, account) => {
      const { opulHolderList, totalValue } = prev;
      const balance = accountBalances[account].filter(
        (balance) => balance.currency === OPULENCE_CURRENCY.currency
      )[0];
      const balanceValue = parseFloat(balance.value);
      if (!balanceValue) return prev;
      opulHolderList.push({
        account,
        balance: balanceValue,
      });
      return {
        opulHolderList,
        totalValue: totalValue + balanceValue,
      };
    },
    {
      opulHolderList: [] as Balance[],
      totalValue: 0,
    }
  );
  return result;
}

/**
 * Fetch balances by calling the fetchBalanceDataForEarn function and distribute drops to stakers according to their holding amounts.
 *
 * @param {object} client - XRPL Client object
 * @returns {void}
 */
const runDrops = async () => {
  const startTime = new Date();

  const client = await getClient();

  const { opulHolderList, totalValue } = await fetchBalanceDataForEarn();
  const wallet = getEarnWallet();

  const poolBalance = await getBalanceOfOpulence(client, wallet.classicAddress);

  if (poolBalance < dailyReward) {
    console.log("Not enough pool balance for earn daily rewarding!!!");
    return;
  }
  if (totalValue === 0) {
    console.log("No opulence holding by stakers!!!");
    return;
  }
  for (const holder of opulHolderList) {
    try {
      if (wallet.classicAddress === holder.account || !(holder.balance > 0))
        continue;
      const rewardAmount = parseFloat(
        (
          dailyReward *
          Math.min(OPUL_REWARD_MAX_PERCENT / 100, holder.balance / totalValue)
        ).toFixed(6)
      );
      if (!(rewardAmount > 0)) continue;
      const txjson = {
        TransactionType: "Payment",
        Account: wallet.classicAddress,
        Amount: {
          value: rewardAmount.toString(),
          currency: opulenceToken.currency.currency,
          issuer: opulenceToken.currency.issuer,
        },
        Destination: holder.account,
      };
      await requestXrpTransaction(client, wallet, txjson);
      await OpulenceEarn.findOneAndUpdate(
        {
          walletAddress: holder.account,
        },
        { lastUpdated: new Date() }
      );
    } catch (error) {
      console.log("runEarnDrops : ");
      console.log(error);
    }
  }

  await client.disconnect();

  const costTime = new Date().getTime() - startTime.getTime();
  console.log("costTimeForEarn", costTime);
  console.log("Distributed for earn reward successfully.");
};

export default runDrops;
