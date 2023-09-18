import { AccountLinesResponse, AccountLinesTrustline, Client, Transaction, Wallet } from 'xrpl';
import { OPUL_REWARD_MAX_PERCENT, XRPL_CURRENCY_LIST } from '../../config'
import OpulenceFaucet from "../../models/OpulenceFaucet"
import { getBalanceOfOpulence, getBalanceOfXrp, getBalances, getClient, getMultipleBalances } from '../../utils/xrpl-utils';
import { getNFTOwnersFromIssuerAndTaxon, getRewardsForFaucet } from '../../utils/api-utils';

const opulenceToken = XRPL_CURRENCY_LIST[0];
const minHoldingAmountForFaucet = parseInt(process.env.HOLDING_AMOUNT_FOR_FAUCET);

const getAccountRegisteredOpulFaucet = async () => {
  const pageSize = 100; // Number of documents to retrieve per query
  let page = 0;
  const accounts: any[] = [];
  while (true) {
    const _stakers = await OpulenceFaucet.find()
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
  const stakers = await getAccountRegisteredOpulFaucet();
  const accounts = stakers.map(staker => staker.walletAddress);
  const opulBalances = await getMultipleBalances(accounts, opulenceToken.currency);
  const rewards = await getRewardsForFaucet();

  if(Object.keys(rewards).length > stakers.length) {
    const savePromises = stakers.map(async staker => {
      const balance = opulBalances[staker.walletAddress][0]?.value;
      if(parseFloat(balance || "0") < minHoldingAmountForFaucet) return;
      if(rewards[staker.walletAddress] > 0) {
        await staker.updateOne({
          reward: staker.reward + rewards[staker.walletAddress]
        });
      }
    });
    await Promise.all(savePromises);
  } else {
    const savePromises = Object.keys(rewards).map(async account => {
      const balance = opulBalances[account][0]?.value;
      if(parseFloat(balance || "0") < minHoldingAmountForFaucet) return;
      if(rewards[account] > 0) {
        const staker = stakers.find(staker => staker.walletAddress === account)
        staker.updateOne({
          reward: staker.reward + rewards[staker.walletAddress]
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
  console.log("costTimeForFaucet", costTime);
  
  console.log("Saved successfully for faucet.");
}

export default runDrops;