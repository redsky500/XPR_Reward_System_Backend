import OpulenceStake from "../../models/OpulenceStake";
import {
  calcRewardAndDropForStakeOrArt,
  getStakeWallet,
} from "../../utils/xrpl-utils";
import { minHoldingAmountForStake, tierRewards } from "../../config";

/**
 * Distribute drops to stakers according to their holding amounts.
 */
const runDrops = async () => {
  const startTime = new Date();
  try {
    const wallet = getStakeWallet();
    const type = "stake";
    await calcRewardAndDropForStakeOrArt(
      type,
      tierRewards,
      OpulenceStake,
      minHoldingAmountForStake,
      wallet
    );
  } catch (error) {
    console.log(error);
  }
  const costTime = new Date().getTime() - startTime.getTime();
  console.log("costTimeForStake", costTime);
  console.log("Distributed for stake reward successfully.");
};

export default runDrops;
