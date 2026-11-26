
import express from "express"
import { getResume, uploadResume } from "../controllers/resume.controller.js"
import { upload } from "../middleware/multer.js"

const resumeRouter = express.Router()

// post route - 
resumeRouter.post("/upload", upload.single("resume"), uploadResume)


// get route
resumeRouter.get("/get-resume", getResume)

export default resumeRouter