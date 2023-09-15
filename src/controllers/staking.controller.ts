import { NextFunction, Request, Response, Router } from "express";
import { createOpulenceEarn } from "../services/reward/earn.service";
import { createOpulenceFaucet, claimFaucet } from "../services/reward/faucet.service";
import { claimStake, createOpulenceStake } from "../services/reward/stake.service";
import { createSocietyStake } from "../services/reward/societyStake.service";
import OpulenceEarn from "../models/OpulenceEarn"
import OpulenceFaucet from "../models/OpulenceFaucet"
import OpulenceStake from "../models/OpulenceStake";

const router = Router();

router.get(
  "/getOPLEarn/:account",
  async (req: Request, res: Response, next: NextFunction) => {
    const { account } = req.params;
    try {
      const data = await OpulenceEarn.findOne({
        walletAddress: account,
      });
      res.json(data?.walletAddress);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/OPLEarn",
  async (req: Request, res: Response, next: NextFunction) => {
    const { account, user_token } = req.body;
    try {
      const data = await createOpulenceEarn(account, user_token);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/getOPLFaucet/:account",
  async (req: Request, res: Response, next: NextFunction) => {
    const { account } = req.params;
    try {
      const data = await OpulenceFaucet.findOne({
        walletAddress: account,
      });
      res.json(data?.walletAddress);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/OPLFaucet",
  async (req: Request, res: Response, next: NextFunction) => {
    const { account, user_token } = req.body;
    try {
      const user = await createOpulenceFaucet(account, user_token);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/claimOPLFaucet",
  async (req: Request, res: Response, next: NextFunction) => {
    const { account, user_token } = req.body;
    try {
      const result = await claimFaucet(account, user_token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/getOPLStake/:account",
  async (req: Request, res: Response, next: NextFunction) => {
    const { account } = req.params;
    try {
      const data = await OpulenceStake.findOne({
        walletAddress: account,
      });
      res.json(data?.walletAddress);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/OPLStake",
  async (req: Request, res: Response, next: NextFunction) => {
    const { account, user_token } = req.body;
    try {
      const user = await createOpulenceStake(account, user_token);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/claimOPLStake",
  async (req: Request, res: Response, next: NextFunction) => {
    const { account, user_token } = req.body;
    try {
      const result = await claimStake(account, user_token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/societyStaking",
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, tokenAmount } = req.body;
    if (!walletAddress) {
      throw new Error("Please provide walletAddress!");
    }
    try {
      const user = await createSocietyStake(walletAddress, tokenAmount);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

export default router;