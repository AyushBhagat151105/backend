import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./utils/db.js";
import cookieParser from "cookie-parser";
// Importing all routes
import userRouters from "./routes/user.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

db();

app.use("/api/v1/users", userRouters);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
