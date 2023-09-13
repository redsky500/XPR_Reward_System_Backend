
import { Wallet, AccountLinesTrustline, Client, Transaction, AccountLinesRequest, TxResponse } from 'xrpl';
import { XRPL_CURRENCY_LIST } from '../config';

type Balances = {
  oplBalance: number;
}

const opulenceToken = XRPL_CURRENCY_LIST[0];

const checkConnect = async (client: Client) => {
  if(client.isConnected()) return true;
  setTimeout(async () => {
    await client.connect();
    return await checkConnect(client);
  }, 3000);
}

export const getEarnWallet = () => (
  Wallet.fromSecret(process.env.WALLET_SEED_FOR_EARN as string) // Test secret; don't use for real
);

export const getFaucetWallet = () => (
  Wallet.fromSecret(process.env.WALLET_SEED_FOR_FAUCET as string) // Test secret; don't use for real
);

export const getStakeWallet = () => (
  Wallet.fromSecret(process.env.WALLET_SEED_FOR_STAKE as string) // Test secret; don't use for real
);

export const getArtWallet = () => (
  Wallet.fromSecret(process.env.WALLET_SEED_FOR_ART as string) // Test secret; don't use for real
);

export const getClient = () => {
  const PUBLIC_SERVER = process.env.XRPL_URL as string;
  const client = new Client(PUBLIC_SERVER, {timeout: 30000});
  return client;
}

export const getPrepared = async (client: Client, txjson: any): Promise<Transaction> => {
  await checkConnect(client);
  const prepared = await client.autofill(txjson);
  prepared.LastLedgerSequence = (prepared.LastLedgerSequence??0)
  prepared.Sequence = (prepared.Sequence??0)
  return prepared;
}

export const submitAndWait = async (client: Client, tx_blob: string): Promise<TxResponse<Transaction>> => {
  await checkConnect(client);
  const result = client.submitAndWait(tx_blob);
  return result;
}
/**
 * Get opulence token balance of account
 * @param {string} account - Wallet address of holder
 * @returns {number} - Returns the balance
 */
export const getBalanceOfOpulence = async (client: Client, account: string):Promise<number> => {
  await checkConnect(client);
  const poolInfo = await client.request({
    command: 'account_lines',
    account,
  });

  const balance = parseInt(poolInfo.result.lines.find((line: AccountLinesTrustline) => line.currency === opulenceToken.currency.currency)?.balance??"0");
  
  return balance;
}

/**
 * Get xrp balance of account
 * @param {string} account - Wallet address of holder
 * @returns {number} - Returns the balance
 */
export const getBalanceOfXrp = async (client: Client, account: string):Promise<number> => {
  await checkConnect(client);
  const poolInfo = await client.request({
    command: 'account_info',
    account,
  });

  const balance = parseInt(poolInfo.result.account_data.Balance);
  
  return balance;
}

/**
 * Get NFTs of account
 * @param {string} account - Wallet address of holder
 * @returns {object} - Returns the balance
 */
export const calcRewardFromNFTs = async (client: Client, account: string):Promise<number> => {
  await checkConnect(client);
  const poolInfo = await client.request({
    command: 'account_nfts',
    account,
  });

  const queenReward = parseFloat(process.env.QUEEN_REWARD);
  const jokerReward = parseFloat(process.env.JOKER_REWARD);
  const kingReward = parseFloat(process.env.KING_REWARD);

  const reward = poolInfo.result.account_nfts.reduce((sum, b) => {
    if(b.Issuer === process.env.QUEEN_ADDRESS) sum += queenReward
    else if(b.Issuer === process.env.JOKER_ADDRESS) sum += jokerReward
    else if(b.Issuer === process.env.KING_ADDRESS) sum += kingReward
    // else if(b.Issuer === "rMNfauFqNMwJyzEQE2sN4WcrCfLTanVKhq") sum += queenReward
    return sum;
  }, 0);
  
  return reward;
}

/**
 * Get opulence token balance of account
 * @param {string} account - Wallet address of holder
 * @returns {number} - Returns the balance
 */
export const getBalances = async (client: Client, account: string):Promise<Balances> => {
  await checkConnect(client);
  // Create an AccountInfoRequest for the user's address
  const accountLinesRequest: AccountLinesRequest = {
    command: "account_lines",
    account,
  };

  const accountInfo = await client.request(accountLinesRequest);

  const oplBalance = parseInt(accountInfo.result.lines.find((line: AccountLinesTrustline) => line.currency === opulenceToken.currency.currency)?.balance??"0");
  
  return {
    oplBalance
  };
}

export const isRegisterableFaucet = async (client: Client, walletAddress: string): Promise<boolean> => {
  await checkConnect(client);
  const { oplBalance } = await getBalances(client, walletAddress);
  if (oplBalance > parseInt(process.env.HOLDING_AMOUNT_FOR_FAUCET)) {
    return false;
  }

  const nftReward = await calcRewardFromNFTs(client, walletAddress);
  if (!(nftReward > 0)) {
    return false;
  }

  return true;
}