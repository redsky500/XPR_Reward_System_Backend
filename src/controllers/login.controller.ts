import { NextFunction, Request, Response, Router } from "express";
import createOPLRewardUser from "../services/oplReward.service";
import createSocietyRewardUser from "../services/societyReward.service";
import createTokenRewardUser from "../services/tokenReward.service";
import createXRPRewardUser from "../services/xrpReward.service";
import auth from "../utils/auth";

const router = Router();

router.post(
  "/OPLLogin",
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("here1", req);
    const { walletAddress, tx } = req.body;
    if (!walletAddress) {
      throw new Error("Please provide walletAddress!");
    }
    try {
      const user = await createOPLRewardUser(walletAddress);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/societyLogin",
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
  "/tokenLogin",
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
  "/XRPLogin",
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