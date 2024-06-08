import { Router } from "express";
import { verifyTokenJWT } from "../controllers/verifyTokenJWT";

const router = Router();

router.post("/verifyTokenJWT", verifyTokenJWT);

export const verifyTokenJWTRouter = router;
