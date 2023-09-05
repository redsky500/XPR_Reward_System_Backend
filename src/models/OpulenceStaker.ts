import mongoose from "mongoose";

const OpulenceStakerSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const OpulenceStaker = mongoose.model("OpulenceStaker", OpulenceStakerSchema);

export default OpulenceStaker;