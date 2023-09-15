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

const getAccountRegisteredOpulEarn = async () => {
  const pageSize = 100; // Number of documents to retrieve per query
  let page = 0;
  const accounts: string[] = [];
  while (true) {
    const _stakers = await OpulenceEarn.find()
      .skip(page * pageSize)
      .limit(pageSize);
    for (const staker of _stakers) {
      accounts.push(staker.walletAddress);
    }
    if (_stakers.length === 0) {
      break; // No more documents left, exit loop
    }
    page++; // Move to next page for the next iteration
  }
  return accounts;
};

/**
 * Fetch all stakers from the database, get their opulence balance, and return an array of the data.
 *
 * @param {object} client - XRPL Client object
 * @returns {Array} - Returns an array of staker data
 */
async function fetchData() {
  const accounts = await getAccountRegisteredOpulEarn();

  const OPULENCE_CURRENCY = XRPL_CURRENCY_LIST[0].currency;
  const accountBalances = await getMultipleBalances(
    accounts,
    OPULENCE_CURRENCY
  );

  const result = Object.keys(accountBalances).reduce(
    (prev, account) => {
      const { balanceData, totalBalance } = prev;
      const balance = accountBalances[account].filter(
        (balance) => balance.currency === OPULENCE_CURRENCY.currency
      )[0];
      if (!balance) return prev;
      balanceData.push({
        account,
        balance: parseFloat(balance.value),
      });
      return {
        balanceData,
        totalBalance: totalBalance + (parseFloat(balance.value) || 0),
      };
    },
    {
      balanceData: [] as Balance[],
      totalBalance: 0,
    }
  );
  return result;
}

/**
 * Fetch balances by calling the fetchData function and distribute drops to stakers according to their holding amounts.
 *
 * @param {object} client - XRPL Client object
 * @returns {void}
 */
const runDrops = async () => {
  const startTime = new Date();

  const client = getClient();
  await client.connect();

  const { balanceData, totalBalance } = await fetchData();
  const wallet = getEarnWallet();

  const poolBalance = await getBalanceOfOpulence(client, wallet.classicAddress);

  if (poolBalance < dailyReward) {
    console.log("Not enough pool balance for earn daily rewarding!!!");
    return;
  }

  if (totalBalance === 0) {
    console.log("No opulence holding by stakers!!!");
    return;
  }

  const dropPromises = balanceData.map(async (data, index) => {
    try {
      const currentBalance = data.balance;
      if (currentBalance > 0) {
        const rewardAmount = parseFloat(
          (
            dailyReward *
            Math.min(
              OPUL_REWARD_MAX_PERCENT / 100,
              currentBalance / totalBalance
            )
          ).toFixed(6)
        );
        if (!(rewardAmount > 0)) return;
        if (wallet.classicAddress === data.account) return;
        const txjson = {
          TransactionType: "Payment",
          Account: wallet.classicAddress,
          Amount: {
            value: `${rewardAmount}`,
            currency: opulenceToken.currency.currency,
            issuer: opulenceToken.currency.issuer,
          },
          Destination: data.account,
        };
        const tx = await requestXrpTransaction(client, wallet, txjson, index);
      }
    } catch (error) {
      console.log(error);
    }
  });

  await Promise.all(dropPromises);

  await client.disconnect();

  const costTime = new Date().getTime() - startTime.getTime();
  console.log("costTimeForEarn", costTime);
  console.log("Distributed for earn reward successfully.");
};

export default runDrops;
