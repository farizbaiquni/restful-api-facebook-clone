import { Router } from "express";
import { getProfileById } from "../controllers/profiles";

const router = Router();

router.get("/profile", getProfileById);

export const profileRouter = router;
