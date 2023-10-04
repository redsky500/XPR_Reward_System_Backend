import { NextFunction, Request, Response, Router } from "express";
import { getOPXRate } from "../utils/xrpl-utils";
import { createOffer } from "../services/opulence/opulence.service";

const router = Router();

router.get(
  "/OPXrate",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rate = await getOPXRate();
      res.json(rate);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/buyToken",
  async (req: Request, res: Response, next: NextFunction) => {
    const { user_token, amount } = req.body;
    try {
      const result = await createOffer(user_token, amount);
      res.json(result);
    } catch (error) {
      return res.send({
        status: "failed",
        data: typeof error === "string" ? error : undefined,
      });
    }
  }
);

export default router;
