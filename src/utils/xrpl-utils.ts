
import { AccountLinesTrustline, Client, Transaction, AccountLinesRequest } from 'xrpl';
import { XRPL_CURRENCY_LIST, HOLDING_AMOUNT_FOR_FAUCET } from '../config';

const PUBLIC_SERVER = process.env.XRPL_URL as string;
const client = new Client(PUBLIC_SERVER);
const opulenceToken = XRPL_CURRENCY_LIST[0];
/**
 * Get opulence token balance of account
 * @param {string} account - Wallet address of holder
 * @returns {number} - Returns the balance
 */
export const getBalanceOfOpulence = async (account: string):Promise<number> => {
  await client.connect();
  const poolInfo = await client.request({
    command: 'account_lines',
    account,
  });

  const balance = parseInt(poolInfo.result.lines.find((line: AccountLinesTrustline) => line.currency === opulenceToken.currency.currency)?.balance??"0");
  await client.disconnect();
  
  return balance;
}


/**
 * Get opulence token balance of account
 * @param {string} account - Wallet address of holder
 * @returns {number} - Returns the balance
 */
export const getBalanceOfNft = async (account: string, nft: string):Promise<number> => {
  await client.connect();
  // Create an AccountInfoRequest for the user's address
  const accountLinesRequest: AccountLinesRequest = {
    command: "account_lines",
    account,
  };

  const accountInfo = await client.request(accountLinesRequest);
  console.log("accountInfo", accountInfo.result.lines);

  const balance = parseInt(accountInfo.result.lines.find((line: AccountLinesTrustline) => line.currency === nft)?.balance??"0");
  await client.disconnect();
  
  return balance;
}
