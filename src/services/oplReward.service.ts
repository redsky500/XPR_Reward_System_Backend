import prisma from "../../prisma/prisma-client";

const createOPLRewardUser = async (walletAddress: string, tokenAmount: string) => {
  try {
    const oPLReward = await prisma.oPLReward.findFirst({
      where: {
        walletAddress: walletAddress,
      },
    });
    if (oPLReward) {
      return "User already registered!"
    }

    await prisma.oPLReward.create({
      data: {
        walletAddress: walletAddress,
        tokenAmount: tokenAmount,
      },
    });
    return "User added successfully!"
  } catch {
    return "Unable to create user! Database error";
  }
};

export default createOPLRewardUser;
