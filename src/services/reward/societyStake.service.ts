import OpulenceSocietyStake from "../../models/OpulenceSocietyStake"

export const createSocietyStake = async (walletAddress: string, tokenAmount: string) => {
  try {
    const societyReward = await OpulenceSocietyStake.findOne({
      walletAddress: walletAddress,
    });
    if (societyReward) {
      return "User already registered!"
    }

    await OpulenceSocietyStake.create({
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
