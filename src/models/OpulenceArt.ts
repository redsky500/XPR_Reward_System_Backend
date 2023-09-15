import mongoose from "mongoose";

const OpulenceArtSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    unique: true,
    required: true,
  },
}, { timestamps: true });

const OpulenceArt = mongoose.model("OpulenceArt", OpulenceArtSchema);

export default OpulenceArt;