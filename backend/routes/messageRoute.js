import express from "express"
import { protect } from "../middlewares/authMiddleware.js"
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/messageController.js"

const router = express.Router()

router.get("/users", protect, getUsersForSidebar)
router.get("/:id", protect, getMessages)
router.post("/send/:id", protect ,sendMessage)

export default router