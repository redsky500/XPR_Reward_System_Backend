import prisma from "../../prisma/prisma-client";

const createTokenRewardUser = async (walletAddress: string, tokenAmount: string) => {
  try {
    const tokenReward = await prisma.tokenReward.findFirst({
      where: {
        walletAddress: walletAddress,
      },
    });
    if (tokenReward) {
      return "User already registered!"
    }
    await prisma.tokenReward.create({
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

export default createTokenRewardUser;
