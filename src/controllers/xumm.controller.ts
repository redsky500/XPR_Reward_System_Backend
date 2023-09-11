import { NextFunction, Request, Response, Router } from "express";
import runXummTransaction from "../services/xumm.service";

const router = Router();

router.post(
  "/xumm",
  async (req: Request, res: Response, next: NextFunction) => {
    const { txjson, user_token } = req.body;
    try {
      const data = await runXummTransaction(txjson, user_token);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

export default router;