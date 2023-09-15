import mongoose from "mongoose";

const OpulenceFaucetSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    unique: true,
    required: true,
  },
  reward: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

const OpulenceFaucet = mongoose.model("OpulenceFaucet", OpulenceFaucetSchema);

export default OpulenceFaucet;