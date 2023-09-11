import { NextFunction, Request, Response, Router } from "express";
import registerOpulenceEarn from "../services/reward/earn.service";
import createSocietyStake from "../services/reward/societyStake.service";
import createOpulenceStake from "../services/reward/stake.service";
import createOpulenceFaucet from "../services/reward/faucet.service";
import OpulenceEarn from "../models/OpulenceEarn"

const router = Router();

router.get(
  "/getOPLStaking/:account",
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
  "/OPLStaking",
  async (req: Request, res: Response, next: NextFunction) => {
    const { account, user_token } = req.body;
    try {
      const data = await registerOpulenceEarn(account, user_token);
      res.json(data);
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

router.post(
  "/tokenStaking",
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, tokenAmount } = req.body;
    if (!walletAddress) {
      throw new Error("Please provide walletAddress!");
    }
    try {
      const user = await createOpulenceStake(walletAddress, tokenAmount);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/XRPStaking",
  async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress, tokenAmount } = req.body;
    if (!walletAddress) {
      throw new Error("Please provide walletAddress!");
    }
    try {
      const user = await createOpulenceFaucet(walletAddress, tokenAmount);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

export default router;