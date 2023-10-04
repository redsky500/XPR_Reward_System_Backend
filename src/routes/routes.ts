import { Router } from "express";
import login from "../controllers/staking.controller";
import xummTx from "../controllers/xumm.controller";
import opulence from "../controllers/opulence.controller";

const loginApi = Router().use("/reward", login)
const xummTxApi = Router().use("/xumm", xummTx)
const opulenceApi = Router().use("/opulence", opulence)

export default Router().use("/api", [loginApi, xummTxApi, opulenceApi]);
