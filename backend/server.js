import express from "express";
import authRouter from "./routes/authRoute.js";
import messageRouter from "./routes/messageRoute.js"
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import path from "path"
dotenv.config();
import { app, server } from "./lib/socket.js";

// const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve()

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173",
  credentials:true
}))

connectDB()

app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter)

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))

  app.get("(.*)", (req, res)=>{
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  })
}

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
