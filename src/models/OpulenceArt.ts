import mongoose from "mongoose";

const OpulenceArtSchema = new mongoose.Schema(
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

const OpulenceArt = mongoose.model("OpulenceArt", OpulenceArtSchema);

export default OpulenceArt;
