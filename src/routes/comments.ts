import { Router } from "express";
import {
  addComment,
  deleteComment,
  getCommentsByPostId,
  updateComment,
} from "../controllers/comments";

const router = Router();

router.get("/v1/comments", getCommentsByPostId);
router.post("/v1/comments", addComment);
router.delete("/v1/comments", deleteComment);
router.put("/v1/comments", updateComment);

export const commmentsRouter = router;
