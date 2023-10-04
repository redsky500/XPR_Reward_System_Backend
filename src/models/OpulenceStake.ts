import mongoose from "mongoose";

const OpulenceStakeSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      unique: true,
      required: true,
    },
    lastUpdated: {
      type: Date,
      required: true,
      default: new Date(0),
    },
  },
  { timestamps: true }
);

const OpulenceStake = mongoose.model("OpulenceStake", OpulenceStakeSchema);

export default OpulenceStake;
