import { NextFunction, Request, Response, Router } from "express";
import registerOpulenceStaker from "../services/staking.service";
import createSocietyRewardUser from "../services/societyReward.service";
import createTokenRewardUser from "../services/tokenReward.service";
import createXRPRewardUser from "../services/xrpReward.service";

const router = Router();

router.post(
  "/xumm",
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

export default router;