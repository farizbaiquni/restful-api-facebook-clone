import { Router } from "express";
import {
  addPostReaction,
  deletePostReaction,
  getPostReactionsByUserId,
  getTop3PostReactionsByPostId,
} from "../controllers/postReactions";

const router = Router();

router.get("/v1/posts/:postId/top-3-reactions", getTop3PostReactionsByPostId);
router.get("/v1/:userId/:postId/post-reactions", getPostReactionsByUserId);
router.post("/v1/post-reactions", addPostReaction);
router.delete("/v1/post-reactions", deletePostReaction);

export const postReactionsRouter = router;
