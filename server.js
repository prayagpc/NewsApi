import express from "express";
import "dotenv/config";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import cors from "cors";
import { limiter } from "./config/ratelimiter.js";
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(express.static("public"));
app.use(helmet());
app.use(cors());
app.use(limiter);
app.get("/", (req, res) => {
  return res.json({ message: "hello hi" });
});

import ApiRoutes from "./routes/api.js";

app.use("/api", ApiRoutes);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
