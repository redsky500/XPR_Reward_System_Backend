import prisma from "../../prisma/prisma-client";
import OpulenceStaker from "../models/OpulenceStaker"

const createOPLRewardUser = async (walletAddress: string) => {
  try {
    console.log("registering...");
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
    console.log("new staker", staker);
    return "User added successfully!"
  } catch {
    return "Unable to create user! Database error";
  }
};

export default createOPLRewardUser;
