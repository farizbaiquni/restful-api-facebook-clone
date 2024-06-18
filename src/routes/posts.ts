import { Router } from "express";
import { addPost, getPosts } from "../controllers/posts";

const router = Router();

router.get("/posts", getPosts);
router.post("/posts", addPost);

export const postsRouter = router;
