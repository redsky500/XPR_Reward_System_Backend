import mongoose from "mongoose";

const OpulenceEarnSchema = new mongoose.Schema(
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

const OpulenceEarn = mongoose.model("OpulenceEarn", OpulenceEarnSchema);

export default OpulenceEarn;
