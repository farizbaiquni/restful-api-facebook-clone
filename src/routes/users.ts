import { Router } from "express";
import { signUp, login } from "../controllers/users";

const router = Router();

router.post("/users/signUp", signUp);
router.post("/users/login", login);

export const routerUsers = router;
