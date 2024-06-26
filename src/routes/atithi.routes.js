import { Router } from "express";
import { registerAtithi } from "../controllers/atithi.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()

router.route("/registerAtithi").post(upload.fields([
    {
        name: "atithiPhoto",
        maxCount: 1
    }
]), registerAtithi)


export default router