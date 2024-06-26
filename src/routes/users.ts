import { Router } from "express";
import { getUserById } from "../controllers/users";
import { authVerifyTokenJWT } from "../middlewares/authVerifyTokenJWT";

const router = Router();

router.get("/v1/users/profile", authVerifyTokenJWT, getUserById);

export const routerUsers = router;
