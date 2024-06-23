import { Router } from "express";
import {
  addComment,
  deleteComment,
  getCommentsByPostId,
} from "../controllers/comments";

const router = Router();

router.get("/v1/comments", getCommentsByPostId);
router.post("/v1/comments", addComment);
router.delete("/v1/comments", deleteComment);

export const commmentsRouter = router;
