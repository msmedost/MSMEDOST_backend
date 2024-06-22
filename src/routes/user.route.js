import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()

router.route("/register").post(upload.fields([
    {
        name: "userPhoto",
        maxCount: 1
    },
    {
        name: "companyLogo",
        maxCount: 1
    }
]), registerUser)

router.route("/login").post(loginUser)

export default router



