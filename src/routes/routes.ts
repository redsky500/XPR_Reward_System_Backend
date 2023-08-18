import { Router } from "express";
import {
  tokenLogin,
  XRPLogin,
  OPLLogin,
  societyLogin,
} from "../controllers/login.controller";

const api = Router()
  .use("/tokenLogin", tokenLogin)
  .use("/XRPLogin", XRPLogin)
  .use("/OPLLogin", OPLLogin)
  .use("/societyLogin", societyLogin);

export default Router().use("/api", api);
