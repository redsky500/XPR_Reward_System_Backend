import { AccountLinesResponse, AccountLinesTrustline, Client, Transaction, Wallet } from 'xrpl';
import { OPUL_REWARD_MAX_PERCENT, XRPL_CURRENCY_LIST, POOL_AMOUNT } from '../config'
import OpulenceStaker from "../models/OpulenceStaker"

const opulenceToken = XRPL_CURRENCY_LIST[0];
const dailyReward = Math.floor(POOL_AMOUNT / 365);

/**
 * Fetch all stakers from the database, get their opulence balance, and return an array of the data.
 * 
 * @param {object} client - XRPL Client object
 * @returns {Array} - Returns an array of staker data
 */
async function fetchData(client: Client) {
  const pageSize = 100; // Number of documents to retrieve per query
  let page = 0;

  const balanceData: (AccountLinesTrustline | undefined)[] = [];
  let totalBalance = 0;

  while (true) {
    const stakers = await OpulenceStaker.find()
      .skip(page * pageSize)
      .limit(pageSize);
    
    const balancesPromises = stakers.map(async staker => {
      const accountInfo = await client.request({
        command: 'account_lines',
        account: staker.walletAddress,
      });
      const line: AccountLinesTrustline = accountInfo.result.lines.find((line: AccountLinesTrustline) => line.currency === opulenceToken.currency.currency) as AccountLinesTrustline
      line.account = staker.walletAddress;
      return line;
    });
    const balances = await Promise.all(balancesPromises);
    totalBalance += balances.reduce(
      (sum, b) => sum + parseInt(b?.balance??"0"),
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
const runDrops = async (client: Client) => {
  const {balanceData, totalBalance} = await fetchData(client);
  const wallet = Wallet.fromSecret(process.env.WALLET_SEED as string) // Test secret; don't use for real
  
  const poolInfo = await client.request({
    command: 'account_lines',
    account: wallet.classicAddress,
  });

  const poolBalance = parseInt(poolInfo.result.lines.find((line: AccountLinesTrustline) => line.currency === opulenceToken.currency.currency)?.balance??"0");
  
  if(poolBalance < dailyReward) {
    console.log("Not enough pool balance for rewarding!!!");
    return;
  }

  if(totalBalance === 0) {
    console.log("No registered opulence staking!!!");
    return;
  }

  const result = balanceData.map(async (data, index) => {
    try {
      const currentBalance = parseInt(data?.balance??"0");
      if(currentBalance > 0) {
        const rewardAmount = (dailyReward * Math.min(OPUL_REWARD_MAX_PERCENT / 100, currentBalance / totalBalance)).toFixed(6)
        const prepared: Transaction = await client.autofill({
          TransactionType: "Payment",
          Account: wallet.classicAddress,
          Amount: {
            value: `${rewardAmount}`,
            currency: opulenceToken.currency.currency,
            issuer: opulenceToken.currency.issuer
          },
          Destination: data?.account as string,
        });
        prepared.LastLedgerSequence = (prepared.LastLedgerSequence??0) + index
        prepared.Sequence = (prepared.Sequence??0) + index

        const signed = wallet.sign(prepared as Transaction);
        return client.submitAndWait(signed.tx_blob);
      }
    } catch (error) {
      console.log(error);
    }
  }); 

  await Promise.all(result);
  console.log("Distributed successfully.");
}

export default runDrops;