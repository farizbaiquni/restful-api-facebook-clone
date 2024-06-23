import { Router } from "express";
import {
  addComment,
  deleteComment,
  getCommentsByPostId,
  getInitialComment,
  updateComment,
} from "../controllers/comments";

const router = Router();

router.get("/v1/comments", getCommentsByPostId);
router.get("/v1/comments/initial-comment", getInitialComment);
router.post("/v1/comments", addComment);
router.delete("/v1/comments", deleteComment);
router.put("/v1/comments", updateComment);

export const commmentsRouter = router;
