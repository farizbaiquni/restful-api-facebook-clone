import { Router } from "express";
import { getUserByToken } from "../controllers/users";
import { authVerifyTokenJWT } from "../middlewares/authVerifyTokenJWT";

const router = Router();

router.get("/v1/users", authVerifyTokenJWT, getUserByToken);

export const routerUsers = router;
