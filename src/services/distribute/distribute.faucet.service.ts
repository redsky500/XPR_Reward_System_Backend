import { AccountLinesResponse, AccountLinesTrustline, Client, Transaction, Wallet } from 'xrpl';
import { OPUL_REWARD_MAX_PERCENT, XRPL_CURRENCY_LIST } from '../../config'
import OpulenceFaucet from "../../models/OpulenceFaucet"
import { calcRewardFromNFTs, getBalanceOfOpulence, getBalanceOfXrp, getBalances, getClient } from '../../utils/xrpl-utils';

type Reward = {
  account: string;
  reward: number;
};

const opulenceToken = XRPL_CURRENCY_LIST[0];
const minHoldingAmountForFaucet = parseInt(process.env.HOLDING_AMOUNT_FOR_FAUCET);

/**
 * Fetch all stakers from the database, get their opulence balance, and return an array of the data.
 * 
 * @returns {Array} - Returns an array of staker data
 */
async function calcRewardAndSaveData() {
  const client = getClient();
  await client.connect();

  const pageSize = 100; // Number of documents to retrieve per query
  let page = 0;

  while (true) {
    const stakers = await OpulenceFaucet.find()
      .skip(page * pageSize)
      .limit(pageSize);
    
    if (stakers.length === 0) {
      break; // No more documents left, exit loop
    }
      
    const rewardPromises = stakers.filter(async staker => {
      const account = staker.walletAddress;
      const balance = await getBalanceOfOpulence(client, account);
      return balance >= minHoldingAmountForFaucet;
    }).map(async staker => {
      const account = staker.walletAddress;
      const reward = await calcRewardFromNFTs(client, account);
      reward > 0 && await staker.updateOne({
        reward: staker.reward + reward
      })
    });
    await Promise.all(rewardPromises);
    
    page++; // Move to next page for the next iteration
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
  console.log("costTime", costTime);
  
  console.log("Saved successfully for faucet.");
}

export default runDrops;