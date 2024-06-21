import { Router } from "express";
import { addComment, getCommentsByPostId } from "../controllers/comments";

const router = Router();

router.get("/v1/comments", getCommentsByPostId);
router.post("/v1/comments", addComment);

export const commmentsRouter = router;
