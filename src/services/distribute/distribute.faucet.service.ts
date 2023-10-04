import { Client } from "xrpl";
import OpulenceFaucet from "../../models/OpulenceFaucet";
import { fetchAllAccountNFTsXrpl, getClient } from "../../utils/xrpl-utils";
import { getAllDataByFilter } from "../../utils/utils";
import {
  collection_QUEEN,
  collection_JOKER,
  collection_KING,
} from "../../../src/config";

const calcDailyFaucetReward = async (client: Client, account: string) => {
  const accountNFTs = await fetchAllAccountNFTsXrpl(client, account);
  const reward = accountNFTs?.reduce((sum, nft) => {
    if (
      nft.Issuer === collection_QUEEN.address &&
      nft.NFTokenTaxon === collection_QUEEN.taxson
    )
      sum += collection_QUEEN.reward;
    else if (
      nft.Issuer === collection_JOKER.address &&
      nft.NFTokenTaxon === collection_JOKER.taxson
    )
      sum += collection_JOKER.reward;
    else if (
      nft.Issuer === collection_KING.address &&
      nft.NFTokenTaxon === collection_KING.taxson
    )
      sum += collection_KING.reward;
    return sum;
  }, 0);
  return reward;
};

async function calcRewardAndSaveData() {
  const client = await getClient();
  const stakers = await getAllDataByFilter(OpulenceFaucet);
  for (const staker of stakers) {
    try {
      const reward = await calcDailyFaucetReward(client, staker.walletAddress);
      await staker.updateOne({ reward, lastUpdated: new Date() });
    } catch (error) {
      console.log("calcRewardAndSaveData : ");
      console.log(error);
    }
  }
  await client.disconnect();
}

const runDrops = async () => {
  const startTime = new Date();
  await calcRewardAndSaveData();
  const costTime = new Date().getTime() - startTime.getTime();
  console.log("costTimeForFaucet", costTime);
  console.log("Saved successfully for faucet.");
};

export default runDrops;
