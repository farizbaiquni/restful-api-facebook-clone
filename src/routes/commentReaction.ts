import { Router } from "express";
import {
  addOrUpdateCommentReaction,
  deleteCommentReaction,
  getCommentReaction,
} from "../controllers/commentReactions";
const router = Router();

router.get("/v1/comment-reactions", getCommentReaction);
router.post("/v1/comment-reactions", addOrUpdateCommentReaction);
router.delete("/v1/comment-reactions", deleteCommentReaction);

export const CommentReactionsRouter = router;
