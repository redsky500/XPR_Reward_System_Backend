import { AccountLinesResponse, AccountLinesTrustline, Client, Transaction, Wallet } from 'xrpl';
import { OPUL_REWARD_MAX_PERCENT, XRPL_CURRENCY_LIST } from '../../config'
import OpulenceStake from "../../models/OpulenceStake"
import { getArtWallet, getBalanceOfOpulence, getBalanceOfXrp, getBalances, getClient, getMultipleBalances, requestXrpTransaction } from '../../utils/xrpl-utils';
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
async function calcRewardAndDrop() {
  const client = getClient();
  await client.connect();
  const wallet = getArtWallet();

  const poolBalance = await getBalanceOfOpulence(client, wallet.classicAddress);
  const dailyReward = (parseInt(process.env.REWARD_FOR_STAKE_TIER_0) + parseInt(process.env.REWARD_FOR_STAKE_TIER_1) + parseInt(process.env.REWARD_FOR_STAKE_TIER_2)) / 365;

  if (poolBalance < dailyReward) {
    console.log("Not enough pool balance for stake daily rewarding!!!");
    return;
  }
  
  const stakers = await getAccountRegisteredOpulStake();
  if (stakers.length === 0) {
    console.log("No registered opulence staking!!!");
    return;
  }

  const accounts = stakers.map(staker => staker.walletAddress);
  const opulBalances = await getMultipleBalances(accounts, opulenceToken.currency);
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
    Math.floor(parseInt(process.env.REWARD_FOR_STAKE_TIER_0) * Math.min(1 / tier_count_0, OPUL_REWARD_MAX_PERCENT / 100) / 365 * 1e6),
    Math.floor(parseInt(process.env.REWARD_FOR_STAKE_TIER_1) * Math.min(1 / tier_count_1, OPUL_REWARD_MAX_PERCENT / 100) / 365 * 1e6),
    Math.floor(parseInt(process.env.REWARD_FOR_STAKE_TIER_2) * Math.min(1 / tier_count_2, OPUL_REWARD_MAX_PERCENT / 100) / 365 * 1e6),
  ];
  if(Object.keys(counts).length > stakers.length) {
    const dropPromises = stakers.map(async (staker, index) => {
      const balance = opulBalances[staker.walletAddress][0]?.value;
      if(parseFloat(balance || "0") < minHoldingAmountForStake) return;
      
      const count = counts[staker.walletAddress];
      if(count === undefined || count > 2) return;
      
      const reward = tier_daily_rewards[count];
      
      const txjson = {
        TransactionType: "Payment",
        Account: wallet.classicAddress,
        Amount: {
          value: `${reward / 1e6}`,
          currency: opulenceToken.currency.currency,
          issuer: opulenceToken.currency.issuer,
        },
        Destination: staker.walletAddress,
      };
      await requestXrpTransaction(client, wallet, txjson, index);
    });
    await Promise.all(dropPromises);
  } else {
    const dropPromises = Object.keys(counts).map(async (account, index) => {
      const balance = opulBalances[account][0]?.value;
      if(parseFloat(balance || "0") < minHoldingAmountForStake) return;
      if(counts[account] > 0) {
        const staker = stakers.find(staker => staker.walletAddress === account);
        if(!(staker?.walletAddress)) return;
        const reward = tier_daily_rewards[counts[staker.walletAddress]];
        
        const txjson = {
          TransactionType: "Payment",
          Account: wallet.classicAddress,
          Amount: {
            value: `${reward / 1e6}`,
            currency: opulenceToken.currency.currency,
            issuer: opulenceToken.currency.issuer,
          },
          Destination: staker.walletAddress,
        };
        await requestXrpTransaction(client, wallet, txjson, index);
      }
    });
    await Promise.all(dropPromises);
  }

  await client.disconnect();
}

/**
 * Fetch balances by calling the fetchData function and distribute drops to stakers according to their holding amounts.
 */
const runDrops = async () => {
  const startTime = new Date();
  await calcRewardAndDrop();
  const costTime = new Date().getTime() - startTime.getTime();
  console.log("costTimeForStake", costTime);
  
  console.log("Saved successfully for stake.");
}

export default runDrops;