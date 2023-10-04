import {
  Wallet,
  AccountLinesTrustline,
  Client,
  Transaction,
  AccountLinesRequest,
  TxResponse,
  AccountNFTsRequest,
  AccountNFToken,
  IssuedCurrency,
} from "xrpl";
import { OPUL_REWARD_MAX_PERCENT, XRPL_CURRENCY_LIST } from "../config";
import {
  getAllDataByFilter,
  getNFTList,
} from "./utils";
import mongoose from "mongoose";
import { NFTXrplService, fetchSocietyNFTs, fetchUtilityNFTs } from "./api-call";

const opulenceToken = XRPL_CURRENCY_LIST[0];

const checkConnect = async (client: Client) => {
  if (client.isConnected()) return true;
  setTimeout(async () => {
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

export const getClient = async () => {
  const PUBLIC_SERVER = process.env.XRPL_URL as string;
  const client = new Client(PUBLIC_SERVER, { connectionTimeout: 30000 });
  await client.connect();
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
  index?: number
) => {
  const prepared: Transaction = await getPrepared(client, txjson);
  const autofilled = await client.autofill(prepared);
  if (index) {
    autofilled.LastLedgerSequence += index;
    autofilled.Sequence += index;
  }
  const signed = wallet.sign(autofilled);
  return submitAndWait(client, signed.tx_blob);
};

export const fetchAllAccountNFTsXrpl = async (
  client: Client,
  account: string
): Promise<AccountNFToken[]> => {
  try {
    const accountNFTs: AccountNFToken[] = [];
    const payload: AccountNFTsRequest = {
      command: "account_nfts",
      account: account,
      ledger_index: "validated",
      limit: 30,
      marker: undefined,
    };

    while (true) {
      const res = await client.request(payload);
      accountNFTs.push(...res.result.account_nfts);
      const { marker } = res.result;
      if (marker === undefined) {
        break;
      }
      payload.marker = marker;
    }
    return accountNFTs;
  } catch (error) {
    console.log(error);
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

  const accountLines: AccountLinesTrustline[] = [];
  let marker;

  while (true) {
    const accountLinesRequest: AccountLinesRequest = {
      command: "account_lines",
      account,
      marker,
    };
    const res = await client.request(accountLinesRequest);
    accountLines.push(...res.result.lines);
    if (!res.result.marker) break;
    marker = res.result.marker;
  }

  const balance = parseInt(
    accountLines.find(
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
 * Get NFTs of account and return the calculated reward for faucet
 * @param {Client} client - xrpl module object
 * @param {string} account - Wallet address of holder
 * @returns {object} - Returns the balance
 */
const calcRewardFromNFTs = async (
  client: Client,
  account: string
): Promise<number> => {
  await checkConnect(client);
  const accountNFTs = await fetchAllAccountNFTsXrpl(client, account);
  const nftList = await getNFTList();

  const queenReward = parseFloat(process.env.QUEEN_REWARD);
  const jokerReward = parseFloat(process.env.JOKER_REWARD);
  const kingReward = parseFloat(process.env.KING_REWARD);
  const knightReward = parseFloat(process.env.KNIGHT_REWARD);

  let countWoW = 0;
  let countWoM = 0;

  const reward = accountNFTs.reduce((sum, b) => {
    if (b.Issuer === nftList[0].issuer && b.NFTokenTaxon === nftList[0].taxon) {
      sum += queenReward;
    } else if (
      b.Issuer === nftList[1].issuer &&
      b.NFTokenTaxon === nftList[1].taxon
    ) {
      sum += jokerReward;
    } else if (
      b.Issuer === nftList[2].issuer &&
      b.NFTokenTaxon === nftList[2].taxon
    ) {
      sum += kingReward;
    } else if (
      b.Issuer === nftList[3].issuer &&
      b.NFTokenTaxon === nftList[3].taxon
    ) {
      countWoW++;
    } else if (
      b.Issuer === nftList[4].issuer &&
      b.NFTokenTaxon === nftList[4].taxon
    ) {
      countWoM++;
    }
    return sum;
  }, 0);

  return reward + Math.min(countWoW, countWoM) * knightReward;
};

export const isRegisterableFaucetOrStake = async (
  client: Client,
  walletAddress: string
): Promise<boolean> => {
  await checkConnect(client);
  const oplBalance = await getBalanceOfOpulence(client, walletAddress);
  if (oplBalance < parseInt(process.env.HOLDING_AMOUNT_FOR_FAUCET))
    throw `You must hold at least ${process.env.HOLDING_AMOUNT_FOR_FAUCET} Opulence.`;

  const nftReward = await calcRewardFromNFTs(client, walletAddress);
  if (!(nftReward > 0))
    throw "You need to hold minimum 1 NFT from these projects (Step 2)";

  return true;
};

export const isRegisterableArt = async (
  client: Client,
  walletAddress: string
): Promise<boolean> => {
  await checkConnect(client);
  const oplBalance = await getBalanceOfOpulence(client, walletAddress);
  if (oplBalance < parseInt(process.env.HOLDING_AMOUNT_FOR_ART))
    throw `You must hold at least ${process.env.HOLDING_AMOUNT_FOR_ART} Opulence.`;

  const nfts: NFTXrplService[] = await fetchUtilityNFTs();
  const counts = await getNFTCountsForAccount(nfts);
  if (!(counts[walletAddress] > 0))
    throw "You need to hold minimum 1 NFT from OpulSociety (Step 2)";

  return true;
};

export const getMultipleBalances = async (
  accounts: string[],
  currency: IssuedCurrency
) => {
  const client = await getClient();

  const balances = await client.request({
    command: "gateway_balances",
    account: currency.issuer,
    currency: currency.currency,
    hotwallet: accounts.map((account) => account),
    strict: true,
  });
  await client.disconnect();
  return balances.result.balances;
};

const getNFTCountsForAccount = async (
  nfts: NFTXrplService[]
) => {
  const counts: {
    [account: string]: number;
  } = {};
  nfts.map((nft) =>
    counts[nft.Owner] = Number(counts[nft.Owner] ?? "0") + 1
  );
  return counts;
};

const validateAndGetAccountsWithBalanceOfStake = async (
  client: Client,
  account: string,
  tierRewards: number[],
  Model: mongoose.Model<any>,
  minHoldingAmount: number,
) => {
  const poolBalance = await getBalanceOfOpulence(client, account);
  const dailyReward =
    tierRewards.reduce((sum, reward) => sum + reward, 0) / 365;

  if (poolBalance < dailyReward) {
    throw "Not enough pool balance for stake daily rewarding!!!";
  }

  const stakers = await getAllDataByFilter(Model);
  if (stakers.length === 0) {
    throw "No registered opulence staking!!!";
  }

  const accounts = stakers.map(({walletAddress}: {walletAddress: string}) => walletAddress);
  
  const opulBalances = await getMultipleBalances(
    accounts,
    opulenceToken.currency
  );
  const accountsWithBalance = accounts.filter((account) => {
    const balance = opulBalances[account][0]?.value;
    return parseFloat(balance || "0") > minHoldingAmount;
  });

  return accountsWithBalance;
};

const getTierDailyRewards = async (
  tierRewards: number[],
  nfts: NFTXrplService[],
) => {
  const counts = await getNFTCountsForAccount(nfts);
  let tier_count_0 = 0;
  let tier_count_1 = 0;
  let tier_count_2 = 0;

  for (const account of Object.keys(counts)) {
    const count = counts[account];
    if (count > 30) {
      tier_count_2++;
      counts[account] = 2; // replace to tier number from nft counts
    } else if (count > 10) {
      tier_count_1++;
      counts[account] = 1;
    } else if (count > 0) {
      tier_count_0++;
      counts[account] = 0;
    }
  }
  const tier_counts = [tier_count_0, tier_count_1, tier_count_2];
  const tier_percents = tier_counts.map(tier_count => {
    if (tier_count === 0) return 0;
    return Math.min(1 / tier_count, OPUL_REWARD_MAX_PERCENT / 100);
  });
  const tier_daily_rewards = tierRewards.map((reward, index) => {
    return (
      (reward *
        tier_percents[index]) /
      365
    ).toFixed(6);
  });

  return { counts, tier_daily_rewards };
};

/**
 * Fetch all stakers from the database, get their opulence balance, and return an array of the data.
 *
 * @returns {Array} - Returns an array of staker data
 */
export const calcRewardAndDropForStakeOrArt = async (
  type: string,
  tierRewards: number[],
  Model: mongoose.Model<any>,
  minHoldingAmount: number,
  wallet: Wallet
) => {
  const client = await getClient();
  const accounts = await validateAndGetAccountsWithBalanceOfStake(
    client,
    wallet.classicAddress,
    tierRewards,
    Model,
    minHoldingAmount
  );
  const nfts: NFTXrplService[] = type === "stake" ? await fetchUtilityNFTs() : await fetchSocietyNFTs();
  const { counts, tier_daily_rewards } = await getTierDailyRewards(tierRewards, nfts);
  for (const account of accounts) {
    try {
      const tier_number = counts[account];
      if (tier_number === undefined || tier_number > 2) continue;
      const reward = tier_daily_rewards[tier_number];
      if (!(Number(reward) > 0)) continue;
      const txjson = {
        TransactionType: "Payment",
        Account: wallet.classicAddress,
        Amount: {
          value: reward,
          currency: opulenceToken.currency.currency,
          issuer: opulenceToken.currency.issuer,
        },
        Destination: account,
      };
      await requestXrpTransaction(client, wallet, txjson);
      await Model.findOneAndUpdate(
        { walletAddress: account },
        { lastUpdated: new Date() }
      );
    } catch (error) {
      console.log("calcRewardAndDropForStakeOrArt : ");
      console.log(error);
    }
  }
  await client.disconnect();
};

const getRate = async (token: IssuedCurrency) => {
  const client = await getClient();
  const offerData = await client.request({
    command: "book_offers",
    taker_gets: {
      currency: "XRP",
    },
    taker_pays: {
      currency: token.currency,
      issuer: token.issuer,
    },
    limit: 10,
  });
  const maxOffer = offerData.result.offers.reduce((max, offer) => {
    return Number(max?.quality) < Number(offer.quality) ? offer : max;
  });
  await client.disconnect();
  return maxOffer.quality;
};

export const getOPXRate = async () => {
  const rate = await getRate(opulenceToken.currency);
  return Number(rate);
};
