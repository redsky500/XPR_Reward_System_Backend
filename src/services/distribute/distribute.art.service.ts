import OpulenceArt from "../../models/OpulenceArt"
import { calcRewardAndDropForStakeOrArt, getArtWallet } from '../../utils/xrpl-utils';
import { minHoldingAmountForArt } from "../../config";

/**
 * Distribute drops to stakers according to their holding amounts.
 */
const runDrops = async () => {
  const startTime = new Date();
  const tierRewards = [
    parseInt(process.env.REWARD_FOR_ART_TIER_0),
    parseInt(process.env.REWARD_FOR_ART_TIER_1),
    parseInt(process.env.REWARD_FOR_ART_TIER_2),
  ];

  const wallet = getArtWallet();
    const type = "art";
    await calcRewardAndDropForStakeOrArt(
      type,
      tierRewards,
      OpulenceArt,
      minHoldingAmountForArt,
      wallet
    );
  const costTime = new Date().getTime() - startTime.getTime();
  console.log("costTimeForArt", costTime);
  
  console.log("Saved successfully for art.");
}

export default runDrops;