// pdf(we get those pdf from frontend) ----> pdf Storage(store data in mongodb) ----> text ----> LLM ----> agent ------> prompt ----> data -----> save mongodb -----> save in redis(by providing user id as a key to access those resume data through redis) ---> pdf delete ----> resume data(score, missing skills, recommendation ....)

import { resumeAgent } from "../agents/resume.agent.js";
import redis from "../../../shared/redis/redis.js";
import extractText from "../config/pdf.js";
import Resume from "../models/resume.model.js";
import fs from "fs";

// controller for upload resume
export const uploadResume = async (req, res) => {
  let file;

  try {
    file = req.file; // we get file from frontend

    if (!file) {
      return res.status(400).json({
        // 400 means frontend error
        success: false,
        message: "Resume PDF is required",
      });
    }

    // we save user id for resume
    // we access those user id from headers - becasue we create "proxyWithHeaders" func in Gateway for saving userId in headers and we send those headers with our resume url
    // we access those userId through those header name - "x-user-id"(in that we store our user Id)
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // after getting file from frontend - we extract those file's text
    // we send those text to resume agent
    const resumeText = await extractText(file.path);
    // file path we get from uploads

    // we provide those extracted file's text to resume agent(which is coming from "../config/pdf.js") as a "params"
    const aiResponse = await resumeAgent(resumeText);

    const resumeData =
      typeof aiResponse === "string" ? JSON.parse(aiResponse) : aiResponse;

    // condition
    // if same user uploads resume another resume - so we overwrite/update those newly uploads resume
    // we find those resume through userID(which we get from headers)
    let resume = await Resume.findOne({ userId });

    // (if resume already exists - we update resume data)
    if (resume) {
      // we rewrite old resume with new resume, when user uploads new resume
      Object.assign(resume, {
        ...resumeData, // we update source resume data(old data)
        extractedText: resumeText, // we update new extarcted text
      });
      await resume.save();
    } else {
      // if don't have resume Data -> so we create a resume
      resume = await Resume.create({
        userId,
        extractedText: resumeText,
        ...resumeData, // resume all data like name, email, phone,....
      });
    }

    // we store resume data in redis
    // we acccess those resume data through userId, which we store in resume key
    await redis.set(`resume:${userId}`, JSON.stringify(resume));

    // we delete pdf file(which we get from req.file - frontend)
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // we see those response on frontend
    return res.status(200).json({
      success: true,
      message: "Resume Analyzed successfully",
      data: resume,
    });
  } catch (error) {
    console.log(error);

    // not store too many files inside uploads folder
    if (file && fs.existsSync(file.path)) {
      // we delete pdf file(which we get from req.file - frontend)
      fs.unlinkSync(file.path);
    }

    // server error
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// controller for get resume data in frontend
export const getResume = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const cache = await redis.get(`resume:${userId}`);

    if (cache) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cache),
      });
    }

    // if no data in cache, means no data in "redis" - so we find data in MongoDb
    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // if we don't get data in redis,
    // we find those data in Mongodb, and if we get data from Mongodb so => we again save those data into redis
    await redis.set(`resume:${userId}`, JSON.stringify(resume));

    // we found data from mongodb
    return res.status(200).json({
      success: true,
      source: "mongodb",
      data: resume,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
