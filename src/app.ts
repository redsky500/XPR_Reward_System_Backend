require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./routes/routes";
import HttpException from "./utils/http-exception.model";
import mongoose from "mongoose";
import runEarnDrops from "./services/distribute/distribute.earn.service";
import runFaucetDrops from "./services/distribute/distribute.faucet.service";
import runStakeDrops from "./services/distribute/distribute.stake.service";
import runArtDrops from "./services/distribute/distribute.art.service";
import { getBalances, calcRewardFromNFTs, getClient } from "./utils/xrpl-utils";
import { Wallet } from "xrpl";

const app = express();

/**
 * App Configuration
 */
// const client = getClient();
// client.connect().then(() => {
//   client.disconnect();
// });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);

// Serves images
// app.use(express.static('public'));

app.get("/", (req: Request, res: Response) => {
  res.json({ status: "API is running on /api" });
});

/* eslint-disable */
app.use(
  (
    err: Error | HttpException,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // @ts-ignore
    if (err && err.name === "UnauthorizedError") {
      return res.status(401).json({
        status: "error",
        message: "missing authorization credentials",
      });
      // @ts-ignore
    } else if (err && err.errorCode) {
      // @ts-ignore
      res.status(err.errorCode).json(err.message);
    } else if (err) {
      res.status(500).json(err.message);
    }
  }
);

/**
 * Server activation
 */

mongoose.connect(process.env.DATABASE_URL as string);

const runAllDrops = () => {
  try {
    runEarnDrops();
    runFaucetDrops();
    // runStakeDrops();
    // runArtDrops();
  } catch (error) {
    console.log("error occurred while running reward...:", error);
  }
};

const runDrops = () => {
  const dailyMilliSecond = 24 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  const nextTime = new Date().setHours(0, 0, 0, 0);
  // const timerToFirstAirdrop =
  //   (nextTime - currentTime + dailyMilliSecond) % dailyMilliSecond;
  const timerToFirstAirdrop = 1000;
  setTimeout(() => {
    runAllDrops();
    setInterval(async () => {
      runAllDrops();
    }, dailyMilliSecond);
  }, timerToFirstAirdrop);
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.info(`server running on port ${PORT}`);
  runDrops();
});
