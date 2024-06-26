import { Router } from "express";
import { login, register } from "../controllers/auths";

const router = Router();

router.post("/v1/auth/register", register);
router.post("/v1/auth/login", login);

export const routerAuths = router;
