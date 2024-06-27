import { Router } from "express";
import { verifyTokenJWT } from "../controllers/verifyTokenJWT";

const router = Router();

router.post("/v1/verifyTokenJWT", verifyTokenJWT);

export const verifyTokenJWTRouter = router;
