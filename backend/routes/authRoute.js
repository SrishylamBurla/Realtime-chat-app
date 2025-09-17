import express from "express"
import { checkAuth, loginController, logoutController, registerController, updateProfile } from "../controllers/authController.js"
import { protect } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.post("/register", registerController)
router.post("/login", loginController)
router.post("/logout", logoutController)
router.put("/update-profile", protect, updateProfile)
router.get("/check", protect, checkAuth)


export default router