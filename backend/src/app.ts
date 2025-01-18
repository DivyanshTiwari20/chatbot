import express from "express";
import {config} from "dotenv";
import morgan from "morgan";// to get a proper log file 
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
config() // for getting .env data

const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan("dev"));// remove this in production

app.use("/api/v1",appRouter);

export default app;
