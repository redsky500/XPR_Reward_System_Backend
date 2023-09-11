import mongoose from "mongoose";

const OpulenceFaucetSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const OpulenceFaucet = mongoose.model("OpulenceFaucet", OpulenceFaucetSchema);

export default OpulenceFaucet;