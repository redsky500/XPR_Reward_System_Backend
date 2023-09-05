import prisma from "../../prisma/prisma-client";
import OpulenceStaker from "../models/OpulenceStaker"

const createOPLRewardUser = async (walletAddress: string) => {
  try {
    const oPLReward = await OpulenceStaker.findOne({
      walletAddress,
    });
    if (oPLReward) {
      return "User already registered!"
    }

    // await prisma.oPLReward.create({
    //   data: {
    //     walletAddress
    //   },
    // });
    const staker = await OpulenceStaker.create({
      walletAddress
    });
    return "User added successfully!"
  } catch {
    return "Unable to create user! Database error";
  }
};

export default createOPLRewardUser;
