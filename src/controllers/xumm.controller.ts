import { NextFunction, Request, Response, Router } from "express";
import runXummTransaction, { subscribe, subscribeForConnect } from "../services/xumm.service";
import { requestTransactionAndGetMessage } from "../utils/xumm-utils";
import { XummPostPayloadBodyJson } from "xumm-sdk/dist/src/types";

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

router.post(
  "/subscribe",
  async (req: Request, res: Response, next: NextFunction) => {
    const { payload_uuid } = req.body;
    try {
      const result = await subscribe(payload_uuid);
      res.json(result);
    } catch (error) {
      return res.send({
        status: "failed",
        data: typeof error === "string" ? error : undefined,
      });
    }
  }
);

router.get(
  "/signIn",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = {
        custom_meta: {
          instruction: "Sign request from " + " to claim reward.",
        },
        txjson: {
          TransactionType: "SignIn",
        },
      } as XummPostPayloadBodyJson;
      const result = await requestTransactionAndGetMessage(payload);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/subscribeForConnect",
  async (req: Request, res: Response, next: NextFunction) => {
    const { payload_uuid } = req.body;
    try {
      const result = await subscribeForConnect(payload_uuid);
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