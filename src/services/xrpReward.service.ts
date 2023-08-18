import prisma from "../../prisma/prisma-client";

const createXRPRewardUser = async (walletAddress: string, tokenAmount: string) => {
  try {
    const xRPReward = await prisma.xRPReward.findFirst({
      where: {
        walletAddress: walletAddress,
      },
    });
    if (xRPReward) {
      return "User already registered!"
    }

    await prisma.xRPReward.create({
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

export default createXRPRewardUser;
