import mongoose from "mongoose";

export interface IOpulenceFaucetSchema {
  walletAddress: string;
  reward: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OpulenceFaucetSchema = new mongoose.Schema<IOpulenceFaucetSchema>(
  {
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
    lastUpdated: {
      type: Date,
      required: true,
      default: new Date(0),
    },
  },
  { timestamps: true }
);

const OpulenceFaucet = mongoose.model("OpulenceFaucet", OpulenceFaucetSchema);

export default OpulenceFaucet;
