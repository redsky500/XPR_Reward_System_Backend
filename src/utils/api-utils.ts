import axios from "axios";
import {sleep} from "sleep";

type NFTHoldByAccount = {
  [account: string]: number;
};

export const getNFTOwnersFromIssuerAndTaxon = async (issuer: string, taxon: string) => {
  const { data } = await axios.get(`${process.env.BITHOMP_API_URL}nft-count/${issuer}`, {
    params: {
      list: "owners",
      taxon: taxon,
    },
    headers: {
      "x-bithomp-token": process.env.BITHOMP_API_KEY
    },
  });
  return data.owners;
}

export const getRewardsForFaucet = async () => {
  const queen_reward = parseInt(process.env.QUEEN_REWARD);
  const joker_reward = parseInt(process.env.JOKER_REWARD);
  const king_reward = parseInt(process.env.KING_REWARD);
  const { QUEEN_ADDRESS, JOKER_ADDRESS, KING_ADDRESS, QUEEN_TAXON, JOKER_TAXON, KING_TAXON } = process.env
  const queen_holders = await getNFTOwnersFromIssuerAndTaxon(QUEEN_ADDRESS, QUEEN_TAXON);
  const joker_holders = await getNFTOwnersFromIssuerAndTaxon(JOKER_ADDRESS, JOKER_TAXON);
  const king_holders = await getNFTOwnersFromIssuerAndTaxon(KING_ADDRESS, KING_TAXON);

  const rewards: NFTHoldByAccount = {};
  queen_holders.map((holder: any) => {
    rewards[holder.owner] = holder.count * queen_reward;
  });
  joker_holders.map((holder: any) => {
    rewards[holder.owner] = (rewards[holder.owner] || 0) + holder.count * joker_reward;
  });
  king_holders.map((holder: any) => {
    rewards[holder.owner] = (rewards[holder.owner] || 0) + holder.count * king_reward;
  });

  return rewards;
}

export const getCountsForStake = async () => {
  const { QUEEN_ADDRESS, JOKER_ADDRESS, KING_ADDRESS, QUEEN_TAXON, JOKER_TAXON, KING_TAXON } = process.env
  const queen_holders = await getNFTOwnersFromIssuerAndTaxon(QUEEN_ADDRESS, QUEEN_TAXON);
  const joker_holders = await getNFTOwnersFromIssuerAndTaxon(JOKER_ADDRESS, JOKER_TAXON);
  const king_holders = await getNFTOwnersFromIssuerAndTaxon(KING_ADDRESS, KING_TAXON);

  const counts: NFTHoldByAccount = {};
  queen_holders.map((holder: any) => {
    counts[holder.owner] = holder.count;
  });
  joker_holders.map((holder: any) => {
    counts[holder.owner] = (counts[holder.owner] || 0) + holder.count;
  });
  king_holders.map((holder: any) => {
    counts[holder.owner] = (counts[holder.owner] || 0) + holder.count;
  });

  return counts;
}

export const getCountsForArt = async () => {
  const { QUEEN_ADDRESS, JOKER_ADDRESS, KING_ADDRESS, QUEEN_TAXON, JOKER_TAXON, KING_TAXON } = process.env
  const nfts = [
    {
      address: QUEEN_ADDRESS,
      taxon: QUEEN_TAXON,
    },
    {
      address: JOKER_ADDRESS,
      taxon: JOKER_TAXON,
    },
    {
      address: KING_ADDRESS,
      taxon: KING_TAXON,
    },
  ];

  const counts: NFTHoldByAccount = {};
  const owners = [];
  let api_call_count = 0;
  let startTime = new Date().getTime() - 60e3;
  for (const nft of nfts) {
    if(api_call_count % 1 === 0) {
      const timeRemaining = Math.ceil((new Date().getTime() - startTime) / 1e3);
      if(timeRemaining < 60 + 1) sleep(timeRemaining);
      startTime = new Date().getTime();
    }
    const holders = await getNFTOwnersFromIssuerAndTaxon(nft.address, nft.taxon);
    owners.push(...holders);
    api_call_count++;
  }

  owners.map((owner: any) => {
    counts[owner.owner] = owner.count;
  });

  return counts;
}
