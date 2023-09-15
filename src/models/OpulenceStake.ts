import mongoose from "mongoose";

const OpulenceStakeSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
  },
  reward: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

const OpulenceStake = mongoose.model("OpulenceStake", OpulenceStakeSchema);

export default OpulenceStake;