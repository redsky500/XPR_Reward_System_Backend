import { Router } from "express";
import login from "../controllers/staking.controller";

const api = Router().use(login)

export default Router().use("/api", api);
