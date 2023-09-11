import mongoose from "mongoose";

const OpulenceStakeSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const OpulenceStake = mongoose.model("OpulenceStake", OpulenceStakeSchema);

export default OpulenceStake;