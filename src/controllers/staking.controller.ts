import { NextFunction, Request, Response, Router } from "express";
import registerOpulenceStaker from "../services/staking.service";
import createSocietyRewardUser from "../services/societyReward.service";
import createTokenRewardUser from "../services/tokenReward.service";
import createXRPRewardUser from "../services/xrpReward.service";

const router = Router();

router.post(
  "/OPLStaking",
  async (req: Request, res: Response, next: NextFunction) => {
    const { txjson, user_token } = req.body;
    try {
      const data = await registerOpulenceStaker(txjson, user_token);
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
      const user = await createSocietyRewardUser(walletAddress, tokenAmount);
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
      const user = await createTokenRewardUser(walletAddress, tokenAmount);
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
      const user = await createXRPRewardUser(walletAddress, tokenAmount);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

export default router;