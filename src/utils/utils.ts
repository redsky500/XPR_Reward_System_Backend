import mongoose from "mongoose";
import { ICollection, fetchNFTListForSociety } from "./api-call";

export interface NFTListInfo {
  issuer: string;
  taxon: number;
}

export const getAllDataByFilter = async (Model: mongoose.Model<any>) => {
  const pageSize = 100; // Number of documents to retrieve per query
  let page = 0;
  const accounts: any[] = [];
  while (true) {
    const _stakers = await Model.find({
      $or: [
        { lastUpdated: { $lt: new Date().setHours(0, 0, 0, 0) } },
        { lastUpdated: { $exists: false } },
      ],
    })
      .skip(page * pageSize)
      .limit(pageSize);
    if (_stakers.length === 0) {
      break; // No more documents left, exit loop
    }
    accounts.push(..._stakers);
    page++; // Move to next page for the next iteration
  }
  return accounts;
};

export const getNFTList = async (): Promise<NFTListInfo[]> => {
  const { QUEEN_ADDRESS, JOKER_ADDRESS, KING_ADDRESS, QUEEN_TAXON, JOKER_TAXON, KING_TAXON, KNIGHT_ADDRESS, KNIGHT_TAXON_0, KNIGHT_TAXON_1 } = process.env;
  const nftList = [
    {
      issuer: QUEEN_ADDRESS,
      taxon: parseInt(QUEEN_TAXON),
    },
    {
      issuer: JOKER_ADDRESS,
      taxon: parseInt(JOKER_TAXON),
    },
    {
      issuer: KING_ADDRESS,
      taxon: parseInt(KING_TAXON),
    },
    {
      issuer: KNIGHT_ADDRESS,
      taxon: parseInt(KNIGHT_TAXON_0),
    },
    {
      issuer: KNIGHT_ADDRESS,
      taxon: parseInt(KNIGHT_TAXON_1),
    },
  ];

  return nftList;
}

export const getNFTListForArt = async (): Promise<NFTListInfo[]> => {
  const societyNFTs = await fetchNFTListForSociety();
  const nftLists = await getNFTList();
  return societyNFTs.map((nft: ICollection) => ({
    issuer: nft.issuer,
    taxon: nft.taxon,
  })).filter((nft: NFTListInfo) =>
    nftLists.filter(
      ({ issuer, taxon }) =>
        issuer === nft.issuer && taxon === nft.taxon
    ).length < 1
  );
}
