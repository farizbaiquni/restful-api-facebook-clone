import { Router } from "express";
import { addPost } from "../controllers/posts";

const router = Router();

router.post("/posts", addPost);

export const postsRouter = router;
