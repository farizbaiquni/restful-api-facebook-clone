import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { routerUsers } from "./routes/users";
import { profileRouter } from "./routes/profiles";
import { verifyTokenJWTRouter } from "./routes/verifyTokenJWT";
import { postsRouter } from "./routes/posts";
import { postReactionsRouter } from "./routes/postReactions";
import { commmentsRouter } from "./routes/comments";
import { routerAuths } from "./routes/auths";

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

// Auths
app.use(routerAuths);

// Users
app.use(routerUsers);

// Posts
app.use(postsRouter);

// Post Reactions
app.use(postReactionsRouter);

// Comments
app.use(commmentsRouter);

// Verify token JWT for login
app.use(verifyTokenJWTRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
