require('dotenv').config()
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes/routes';
import HttpException from './utils/http-exception.model';
import mongoose from "mongoose";
import { XummSdk } from 'xumm-sdk';
import runOpulenceDrops from './services/distribute.service';
import { Client } from 'xrpl';

const xumm = new XummSdk();

const app = express();

/**
 * App Configuration
 */

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
  const PUBLIC_SERVER = "wss://xrp.getblock.io/58137926-e27b-4c5d-985c-b3f0e98fbcab/mainnet/";
  const client = new Client(PUBLIC_SERVER);

  function callFunctionAtSpecificTime(targetTime: Date, callback: ()=>void) {
    const currentTime = new Date();
    const timeDifference = targetTime.getTime() - currentTime.getTime();
  
    // If the target time has already passed for this day, add 24 hours to the time difference
    // const timeToNextCall = timeDifference < 0 ? timeDifference + 24 * 60 * 60 * 1000 : timeDifference;
    const timeToNextCall = 10e3; // set 10s for testing purpose to call drop per 10s

    setTimeout(() => {
      callback(); // Call the desired function
      callFunctionAtSpecificTime(targetTime, callback); // Schedule the next call
    }, timeToNextCall);
  }
  
  // Example usage:
  const targetTime = new Date();
  targetTime.setHours(12, 0, 0, 0); // Set the target time as 12:00:00 (noon)
  
  callFunctionAtSpecificTime(targetTime, async () => {
    try {
      if(!client.isConnected()) await client.connect();
      await runOpulenceDrops(client);
    } catch (error) {
      console.log("error occurred while running drops...:", error);
    }
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.info(`server running on port ${PORT}`);

  runDrops();
});
