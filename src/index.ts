import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { routerUsers } from "./routes/users";
import { authenticate } from "./middlewares/authenticate";
import { profileRouter } from "./routes/profiles";
import { verifyTokenJWTRouter } from "./routes/verifyTokenJWT";
import { postsRouter } from "./routes/posts";
import { postReactionsRouter } from "./routes/postReactions";
import { commmentsRouter } from "./routes/comments";

const app = express();
app.use(cookieParser());
const cors = require("cors");
const port = 4000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(bodyParser.json());

// Users
app.use(routerUsers);

// Posts
app.use(postsRouter);

// Post Reactions
app.use(postReactionsRouter);

// Comments
app.use(commmentsRouter);

// Profiles
app.use("/profile", authenticate, profileRouter);

// Verify token JWT
app.use(verifyTokenJWTRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
