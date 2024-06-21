import { Router } from "express";
import { addPost, getPosts } from "../controllers/posts";

const router = Router();

router.get("/v1/posts", getPosts);
router.post("/v1/posts", addPost);

export const postsRouter = router;
