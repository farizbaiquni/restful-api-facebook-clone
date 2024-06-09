import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { routerUsers } from "./routes/users";
import { authenticate } from "./middlewares/authenticate";
import { profileRouter } from "./routes/profiles";
import { verifyTokenJWTRouter } from "./routes/verifyTokenJWT";
import { postsRouter } from "./routes/posts";

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

// Profiles
app.use("/profile", authenticate, profileRouter);

// Check hello world
// app.use("/", (req: Request, res: Response) => {
//   res.status(200).send("Hello world!");
// });'

// Verify token JWT
app.use(verifyTokenJWTRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
