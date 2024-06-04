import express from "express";
import bodyParser from "body-parser";
import { routerUsers } from "./routes/users";
import { authenticate } from "./middlewares/authenticate";
import { profileRouter } from "./routes/profiles";

const app = express();
const port = 4000;

app.use(bodyParser.json());

// Users
app.use(routerUsers);

// Profiles
app.use("/profile", authenticate, profileRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
