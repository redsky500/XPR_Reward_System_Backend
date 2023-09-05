require('dotenv').config()
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes/routes';
import HttpException from './utils/http-exception.model';
import mongoose from "mongoose";
import { XummSdk } from 'xumm-sdk';
import xrpl from 'xrpl';

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

const runAirdrops = () => {
  const options = {
    label: 'AirdropWallet', // Optional label for wallet
  };
  
  const PUBLIC_SERVER = "wss://xrplcluster.com/"
  const client = new xrpl.Client(PUBLIC_SERVER)

  client.connect().then(async () => {
    const request = {
      "TransactionType": "Payment",
      "Destination": "rMNfauFqNMwJyzEQE2sN4WcrCfLTanVKhq",
      "Amount": "1",
      "Memos": [
        {
          "Memo": {
            "MemoData": "testing airdrop"
          }
        }
      ]
    }

    const wallet = xrpl.Wallet.fromSecret("008155348570061908338171314490370515413730054706") // Test secret; don't use for real

    const prepared = await client.autofill({
      "TransactionType": "Payment",
      "Account": wallet.address,
      // "Amount": xrpl.xrpToDrops("1"),
      "Amount": "1",
      "Destination": "rMNfauFqNMwJyzEQE2sN4WcrCfLTanVKhq"
    });
    const signed = wallet.sign(prepared);
    client.submitAndWait(signed.tx_blob);
  })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.info(`server up on port ${PORT}`);
});
