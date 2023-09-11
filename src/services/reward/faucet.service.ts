import OpulenceFaucet from "../../models/OpulenceFaucet"

const createOpulenceFaucet = async (walletAddress: string, tokenAmount: string) => {
  try {
    const faucet = await OpulenceFaucet.findOne({
      walletAddress: walletAddress,
    });
    if (faucet) {
      return "User already registered!"
    }

    await OpulenceFaucet.create({
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

export default createOpulenceFaucet;
