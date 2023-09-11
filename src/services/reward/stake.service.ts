import OpulenceStake from "../../models/OpulenceStake"

const createOpulenceStake = async (walletAddress: string, tokenAmount: string) => {
  try {
    const tokenReward = await OpulenceStake.findOne({
      walletAddress: walletAddress,
    });
    if (tokenReward) {
      return "User already registered!"
    }
    await OpulenceStake.create({
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

export default createOpulenceStake;
