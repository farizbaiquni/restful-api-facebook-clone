import { Router } from "express";
import { signUp, login, getUserById } from "../controllers/users";
import { authVerifyTokenJWT } from "../middlewares/authVerifyTokenJWT";

const router = Router();

router.post("/users/signUp", signUp);
router.post("/users/login", login);
router.get("/users/profile", authVerifyTokenJWT, getUserById);

export const routerUsers = router;
