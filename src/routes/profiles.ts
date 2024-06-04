import { Router } from "express";
import { getProfileById } from "../controllers/profiles";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.get("/profile", authenticate, getProfileById);

export const profileRouter = router;
