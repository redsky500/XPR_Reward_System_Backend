import prisma from "../../prisma/prisma-client";

const createSocietyRewardUser = async (walletAddress: string, tokenAmount: string) => {
  try {
    const societyReward = await prisma.societyReward.findFirst({
      where: {
        walletAddress: walletAddress,
      },
    });
    if (societyReward) {
      return "User already registered!"
    }

    await prisma.societyReward.create({
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

export default createSocietyRewardUser;
