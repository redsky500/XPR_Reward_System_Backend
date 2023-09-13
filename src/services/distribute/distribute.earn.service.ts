import { AccountLinesResponse, AccountLinesTrustline, Client, Transaction, Wallet } from 'xrpl';
import { OPUL_REWARD_MAX_PERCENT, XRPL_CURRENCY_LIST } from '../../config'
import OpulenceEarn from "../../models/OpulenceEarn"
import { getBalanceOfOpulence, getClient, getEarnWallet, requestXrpTransaction } from '../../utils/xrpl-utils';

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
async function fetchData(client: Client) {
  const pageSize = 100; // Number of documents to retrieve per query
  let page = 0;

  const balanceData: (Balance | undefined)[] = [];
  let totalBalance = 0;

  while (true) {
    const stakers = await OpulenceEarn.find()
      .skip(page * pageSize)
      .limit(pageSize);
    
    const balancesPromises = stakers.map(async staker => {
      const account = staker.walletAddress;
      const balance = await getBalanceOfOpulence(client, account);
      return {
        account,
        balance,
      };
    });
    const balances = await Promise.all(balancesPromises);
    totalBalance += balances.reduce(
      (sum, b) => sum + b.balance,
      0
    );
    balanceData.push(...balances);

    if (stakers.length === 0) {
      break; // No more documents left, exit loop
    }
    
    page++; // Move to next page for the next iteration
  }

  return {balanceData, totalBalance}
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

  const {balanceData, totalBalance} = await fetchData(client);
  const wallet = getEarnWallet();
  
  const poolBalance = await getBalanceOfOpulence(client, wallet.classicAddress);
  if(poolBalance < dailyReward) {
    console.log("Not enough pool balance for daily rewarding!!!");
    return;
  }

  if(totalBalance === 0) {
    console.log("No registered opulence staking!!!");
    return;
  }

  const result = balanceData.map(async (data, index) => {
    try {
      const currentBalance = data.balance;
      if(currentBalance > 0) {
        const rewardAmount = parseFloat((dailyReward * Math.min(OPUL_REWARD_MAX_PERCENT / 100, currentBalance / totalBalance)).toFixed(6));
        if(!(rewardAmount > 0)) return;
        const txjson = {
          TransactionType: "Payment",
          Account: wallet.classicAddress,
          Amount: {
            value: `${rewardAmount}`,
            currency: opulenceToken.currency.currency,
            issuer: opulenceToken.currency.issuer
          },
          Destination: data?.account as string,
        };
        return await requestXrpTransaction(client, wallet, txjson);
      }
    } catch (error) {
      console.log(error);
    }
  });

  await Promise.all(result);

  await client.disconnect();

  const costTime = new Date().getTime() - startTime.getTime();
  console.log("costTimeForEarn", costTime);
  console.log("Distributed for earn reward successfully.");
}

export default runDrops;