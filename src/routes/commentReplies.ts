import { Router } from "express";
import {
  addCommentReply,
  deleteCommentReply,
  getCommentReplies,
  updateCommentReply,
} from "../controllers/commentReplies";

const router = Router();

router.get("/v1/comment-replies", getCommentReplies);
router.post("/v1/comment-replies", addCommentReply);
router.delete("/v1/comment-replies", deleteCommentReply);
router.put("/v1/comment-replies", updateCommentReply);

export const commmentRepliesRouter = router;
