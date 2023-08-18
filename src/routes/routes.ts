import { Router } from "express";
import login from "../controllers/login.controller";

const api = Router().use(login)

export default Router().use("/api", api);
