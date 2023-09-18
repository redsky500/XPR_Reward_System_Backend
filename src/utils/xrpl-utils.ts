import {
  Wallet,
  AccountLinesTrustline,
  Client,
  Transaction,
  AccountLinesRequest,
  TxResponse,
  AccountNFTsResponse,
  AccountNFTsRequest,
  AccountNFToken,
  IssuedCurrency,
} from "xrpl";
import { XRPL_CURRENCY_LIST } from "../config";

type Balances = {
  oplBalance: number;
};

const opulenceToken = XRPL_CURRENCY_LIST[0];

const checkConnect = async (client: Client) => {
  if (client.isConnected()) return true;
  setTimeout(async () => {
    await client.connect();
    return await checkConnect(client);
  }, 60000);
};

export const getEarnWallet = () =>
  Wallet.fromSecret(process.env.WALLET_SEED_FOR_EARN as string); // Test secret; don't use for real

export const getFaucetWallet = () =>
  Wallet.fromSecret(process.env.WALLET_SEED_FOR_FAUCET as string); // Test secret; don't use for real

export const getStakeWallet = () =>
  Wallet.fromSecret(process.env.WALLET_SEED_FOR_STAKE as string); // Test secret; don't use for real

export const getArtWallet = () =>
  Wallet.fromSecret(process.env.WALLET_SEED_FOR_ART as string); // Test secret; don't use for real

export const getClient = () => {
  const PUBLIC_SERVER = process.env.XRPL_URL as string;
  const client = new Client(PUBLIC_SERVER, { connectionTimeout: 30000 });
  return client;
};

const getPrepared = async (
  client: Client,
  txjson: any
): Promise<Transaction> => {
  await checkConnect(client);
  const prepared = await client.autofill(txjson);
  prepared.LastLedgerSequence = prepared.LastLedgerSequence ?? 0;
  prepared.Sequence = prepared.Sequence ?? 0;
  return prepared;
};

const submitAndWait = async (
  client: Client,
  tx_blob: string
): Promise<TxResponse<Transaction>> => {
  await checkConnect(client);
  const result = client.submitAndWait(tx_blob);
  return result;
};

export const requestXrpTransaction = async (
  client: Client,
  wallet: Wallet,
  txjson: any,
  index?: number,
) => {
  const prepared: Transaction = await getPrepared(client, txjson);
  const autofilled = await client.autofill(prepared);
  if(index) {
    autofilled.LastLedgerSequence += index;
    autofilled.Sequence += index;
  }
  const signed = wallet.sign(autofilled);
  return submitAndWait(client, signed.tx_blob);
};

export const fetchAccountNFTsXrpl = async (
  client: Client,
  account: string,
  marker?: string
): Promise<AccountNFToken[]> => {
  try {
    const accountNFTs: AccountNFToken[] = [];
    const payload: AccountNFTsRequest = {
      command: "account_nfts",
      account: account,
      ledger_index: "validated",
      limit: 30,
    };
    let res = await client.request(payload);

    while (true) {
      accountNFTs.push(...res.result.account_nfts);
      const {marker} = res.result;
      if (marker === undefined) {
        break
      }
      payload.marker = marker;
      res = await client.request(payload);
    }
    return accountNFTs;
  } catch (error) {
    return;
  }
};

/**
 * Get opulence token balance of account
 * @param {string} account - Wallet address of holder
 * @returns {number} - Returns the balance
 */
export const getBalanceOfOpulence = async (
  client: Client,
  account: string
): Promise<number> => {
  await checkConnect(client);
  const poolInfo = await client.request({
    command: "account_lines",
    account,
  });

  const balance = parseInt(
    poolInfo.result.lines.find(
      (line: AccountLinesTrustline) =>
        line.currency === opulenceToken.currency.currency
    )?.balance ?? "0"
  );

  return balance;
};

/**
 * Get xrp balance of account
 * @param {string} account - Wallet address of holder
 * @returns {number} - Returns the balance
 */
export const getBalanceOfXrp = async (
  client: Client,
  account: string
): Promise<number> => {
  await checkConnect(client);
  const poolInfo = await client.request({
    command: "account_info",
    account,
  });

  const balance = parseInt(poolInfo.result.account_data.Balance);

  return balance;
};

/**
 * Get NFTs of account
 * @param {string} account - Wallet address of holder
 * @returns {object} - Returns the balance
 */
export const calcRewardFromNFTs = async (
  client: Client,
  account: string
): Promise<number> => {
  await checkConnect(client);
  let accountNFTs: AccountNFToken[] = await fetchAccountNFTsXrpl(client, account);
  
  const queenReward = parseFloat(process.env.QUEEN_REWARD);
  const jokerReward = parseFloat(process.env.JOKER_REWARD);
  const kingReward = parseFloat(process.env.KING_REWARD);

  const reward = accountNFTs.reduce((sum, b) => {
    if (
      b.Issuer === process.env.QUEEN_ADDRESS &&
      b.NFTokenTaxon === parseInt(process.env.QUEEN_TAXON)
    )
      sum += queenReward;
    else if (
      b.Issuer === process.env.JOKER_ADDRESS &&
      b.NFTokenTaxon === parseInt(process.env.JOKER_TAXON)
    )
      sum += jokerReward;
    else if (
      b.Issuer === process.env.KING_ADDRESS &&
      b.NFTokenTaxon === parseInt(process.env.KING_TAXON)
    )
      sum += kingReward;
    // else if(b.Issuer === "rMNfauFqNMwJyzEQE2sN4WcrCfLTanVKhq") sum += queenReward
    return sum;
  }, 0);

  return reward;
};

/**
 * Get opulence token balance of account
 * @param {string} account - Wallet address of holder
 * @returns {number} - Returns the balance
 */
export const getBalances = async (
  client: Client,
  account: string
): Promise<Balances> => {
  await checkConnect(client);
  // Create an AccountInfoRequest for the user's address
  const accountLinesRequest: AccountLinesRequest = {
    command: "account_lines",
    account,
  };

  const accountInfo = await client.request(accountLinesRequest);

  const oplBalance = parseInt(
    accountInfo.result.lines.find(
      (line: AccountLinesTrustline) =>
        line.currency === opulenceToken.currency.currency
    )?.balance ?? "0"
  );

  return {
    oplBalance,
  };
};

export const isRegisterable = async (
  client: Client,
  walletAddress: string
): Promise<boolean> => {
  await checkConnect(client);
  const { oplBalance } = await getBalances(client, walletAddress);
  if (oplBalance >= parseInt(process.env.HOLDING_AMOUNT_FOR_FAUCET)) {
    return false;
  }

  const nftReward = await calcRewardFromNFTs(client, walletAddress);
  if (!(nftReward > 0)) {
    return false;
  }

  return true;
};


export const getMultipleBalances = async (accounts: string[], currency:IssuedCurrency) => {
  const client = getClient();
  await client.connect();

  const balances = await client.request({
    command: "gateway_balances",
    account: currency.issuer,
    currency: currency.currency,
    hotwallet: accounts,
    strict: true,
  });

  return balances.result.balances
};