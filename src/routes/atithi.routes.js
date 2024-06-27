import { Router } from "express";
import { atithis, registerAtithi } from "../controllers/atithi.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()

router.route("/registerAtithi").post(upload.fields([
    {
        name: "userPhoto",
        maxCount: 1
    }
]), registerAtithi)

router.route("/atithis").get(atithis)

export default router