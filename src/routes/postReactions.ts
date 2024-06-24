import { Router } from "express";
import {
  addOrUpdatePostReaction,
  deletePostReaction,
  getPostReaction,
  getTop3PostReactions,
} from "../controllers/postReactions";

const router = Router();

router.get("/v1/post-reactions/top-3-reactions", getTop3PostReactions);
router.get("/v1/post-reactions", getPostReaction);
router.post("/v1/post-reactions", addOrUpdatePostReaction);
router.delete("/v1/post-reactions", deletePostReaction);

export const postReactionsRouter = router;
