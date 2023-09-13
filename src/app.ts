require('dotenv').config()
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes/routes';
import HttpException from './utils/http-exception.model';
import mongoose from "mongoose";
import runEarnDrops from './services/distribute/distribute.earn.service';
import runFaucetDrops from './services/distribute/distribute.faucet.service';
import { getBalances, calcRewardFromNFTs, getClient } from './utils/xrpl-utils';
import { Wallet } from 'xrpl';

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

app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'API is running on /api' });
});

/* eslint-disable */
app.use((err: Error | HttpException, req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (err && err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'missing authorization credentials',
    });
    // @ts-ignore
  } else if (err && err.errorCode) {
    // @ts-ignore
    res.status(err.errorCode).json(err.message);
  } else if (err) {
    res.status(500).json(err.message);
  }
});

/**
 * Server activation
 */

mongoose.connect(
  process.env.DATABASE_URL as string
);

const runDrops = () => {
  function callFunctionAtSpecificTime(callback: ()=>void) {
    const currentTime = new Date();
    const targetTime = new Date();
    targetTime.setHours(12, 0, 0, 0); // Set the target time as 12:00:00 (noon)
    const timeDifference = targetTime.getTime() - currentTime.getTime();
  
    // If the target time has already passed for this day, add 24 hours to the time difference
    const timeToNextCall = timeDifference <= 0 ? timeDifference + 24 * 60 * 60 * 1000 : timeDifference;
    // const timeToNextCall = 10e3; // set 10s for testing purpose to call drop per 10s
    // const timeToNextCall = 60*10e3; // set 10min for testing purpose to call drop per 10min

    setTimeout(() => {
      callback(); // Call the desired function
      callFunctionAtSpecificTime(callback); // Schedule the next call
    }, timeToNextCall);
  }
  
  callFunctionAtSpecificTime(async () => {
    try {
      await runEarnDrops();
      await runFaucetDrops();
    } catch (error) {
      console.log("error occurred while running reward...:", error);
    }
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.info(`server running on port ${PORT}`);

  runDrops();
});
