import mongoose from "mongoose";

const OpulenceEarnSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const OpulenceEarn = mongoose.model("OpulenceEarn", OpulenceEarnSchema);

export default OpulenceEarn;