import { AccountLinesResponse, AccountLinesTrustline, Client, Transaction, Wallet } from 'xrpl';
import { OPUL_REWARD_MAX_PERCENT, XRPL_CURRENCY_LIST } from '../../config'
import OpulenceStake from "../../models/OpulenceStake"
import { calcRewardFromNFTs, getBalanceOfOpulence, getBalanceOfXrp, getBalances, getClient, getMultipleBalances } from '../../utils/xrpl-utils';
import { getNFTOwnersFromIssuerAndTaxon, getCountsForStake } from '../../utils/api-utils';

const opulenceToken = XRPL_CURRENCY_LIST[0];
const minHoldingAmountForStake = parseInt(process.env.HOLDING_AMOUNT_FOR_FAUCET);

const getAccountRegisteredOpulStake = async () => {
  const pageSize = 100; // Number of documents to retrieve per query
  let page = 0;
  const accounts: any[] = [];
  while (true) {
    const _stakers = await OpulenceStake.find()
      .skip(page * pageSize)
      .limit(pageSize);
    if (_stakers.length === 0) {
      break; // No more documents left, exit loop
    }
    // for (const staker of _stakers) {
      accounts.push(..._stakers);
    // }
    page++; // Move to next page for the next iteration
  }
  return accounts;
};

/**
 * Fetch all stakers from the database, get their opulence balance, and return an array of the data.
 * 
 * @returns {Array} - Returns an array of staker data
 */
async function calcRewardAndSaveData() {
  const client = getClient();
  await client.connect();
  const stakers = await getAccountRegisteredOpulStake();
  const accounts = stakers.map(staker => staker.walletAddress);
  const opulbalances = await getMultipleBalances(accounts, opulenceToken.currency);
  const counts = await getCountsForStake();
  let tier_count_0 = 0;
  let tier_count_1 = 0;
  let tier_count_2 = 0;
  Object.keys(counts).map(account => {
    const count = counts[account];
    if(count > 30) {
      tier_count_2++;
      counts[account] = 2;
    }
    else if(count > 10) {
      tier_count_1++;
      counts[account] = 1;
    }
    else if(count > 0) {
      tier_count_0++;
      counts[account] = 0;
    }
  });

  const tier_daily_rewards = [
    Math.floor(parseInt(process.env.REWARD_FOR_TIER_0) * Math.min(1 / tier_count_0, OPUL_REWARD_MAX_PERCENT / 100) / 365 * 1e6),
    Math.floor(parseInt(process.env.REWARD_FOR_TIER_1) * Math.min(1 / tier_count_1, OPUL_REWARD_MAX_PERCENT / 100) / 365 * 1e6),
    Math.floor(parseInt(process.env.REWARD_FOR_TIER_2) * Math.min(1 / tier_count_2, OPUL_REWARD_MAX_PERCENT / 100) / 365 * 1e6),
  ];
  if(Object.keys(counts).length > stakers.length) {
    const savePromises = stakers.map(async staker => {
      const balance = opulbalances[staker.walletAddress][0]?.value;
      if(parseFloat(balance || "0") < minHoldingAmountForStake) return;
      
      const count = counts[staker.walletAddress];
      if(count > 2) return;
      
      const reward = tier_daily_rewards[count];
      await staker.updateOne({
        reward: staker.reward + reward
      });
    });
    await Promise.all(savePromises);
  } else {
    const savePromises = Object.keys(counts).map(async account => {
      const balance = opulbalances[account][0]?.value;
      if(parseFloat(balance || "0") < minHoldingAmountForStake) return;
      if(counts[account] > 0) {
        const staker = stakers.find(staker => staker.walletAddress === account)
        staker.updateOne({
          reward: staker.reward + counts[staker.walletAddress]
        });
      }
    });
    await Promise.all(savePromises);
  }

  await client.disconnect();
}

/**
 * Fetch balances by calling the fetchData function and distribute drops to stakers according to their holding amounts.
 */
const runDrops = async () => {
  const startTime = new Date();
  await calcRewardAndSaveData();
  const costTime = new Date().getTime() - startTime.getTime();
  console.log("costTimeForStake", costTime);
  
  console.log("Saved successfully for stake.");
}

export default runDrops;