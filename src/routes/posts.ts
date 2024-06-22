import { Router } from "express";
import {
  addPost,
  deletePost,
  getPosts,
  undoDeletePost,
  undoMultipleDeletePosts,
} from "../controllers/posts";

const router = Router();

router.get("/v1/posts", getPosts);
router.post("/v1/posts", addPost);
router.delete("/v1/posts", deletePost);
router.put("/v1/posts/undo", undoDeletePost);
router.put("/v1/posts/undo-multiple", undoMultipleDeletePosts);

export const postsRouter = router;
