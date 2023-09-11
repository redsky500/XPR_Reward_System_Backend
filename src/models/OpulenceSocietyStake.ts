import mongoose from "mongoose";

const OpulenceSocietyStakeSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const OpulenceSocietyStake = mongoose.model("OpulenceSocietyStake", OpulenceSocietyStakeSchema);

export default OpulenceSocietyStake;