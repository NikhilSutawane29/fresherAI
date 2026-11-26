import redis from "../../../shared/redis/redis.js";
import graph from "../graph/roadmap.graph.js";
import Roadmap from "../models/roadmap.model.js";

export const generateRoadmap = async (req, res) => {
  try {
    const { role, targetPackage, useResume = false, resume } = req.body;

    const userId = req.headers["x-user-id"]; // we get current user-id from headers by accessing those header's name

    if (!role || !targetPackage) {
      return res.status(400).json({
        success: false,
        message: "Role and Target Package are required.",
      });
    }

    if (useResume && !resume) {
      return res.status(400).json({
        success: false,
        message: "Resume data is required.",
      });
    }

    const result = await graph.invoke({
      role,
      targetPackage,
      useResume,
      resume,
    });

    // in mongodb we create a roadmap
    const roadmap = await Roadmap.create({
      userId,
      ...result.roadmap,
    });

    await redis.set(`roadmap:${roadmap._id}`, JSON.stringify(roadmap), "EX", 60*60)

    // when user creates a new roadmap, so old data will be deleted
    await redis.del(`userRoadmaps:${userId}`)

    return res.status(201).json({
      success: true,
      message: "Roadmap generated successfully.",
      data: roadmap,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};










export const getAllRoadmap = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"]; // through this current user id we get all roadmap

    const cache = await redis.get(`userRoadmaps:${userId}`);

    // if data is available in redis
    if (cache) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cache),
      });
    }

    // if not data in redis, so we find from MongoDB based on current user's id and after finding that data, then we set those data in redis
    const roadmaps = await Roadmap.find({userId}).sort({createdAt: -1}) // we sort because we want newest roadmap on top

    await redis.set(`userRoadmaps:${userId}`, JSON.stringify(roadmaps), "EX", 60*60)

    return res.json({
        success: true,
        data: roadmaps,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};











// we want a particular roadmap from all roadmaps - so we get those roadmap through those roadmap's Id
export const getRoadmapById = async (req, res) => {
    try {
        const {id} = req.params // we send those id from "frontend" in params
        const userId = req.headers["x-user-id"];

        // we find those roadmap from redis(cache)
        const cache = await redis.get(`roadmap:${id}`)  // id is those params id

        if(cache) {
            return res.json({
            success: true,
            fromCache: true,
            data: JSON.parse(cache),
        });
        }

        // not get data from redis -> so we find from mongodb and set into redis also
        const roadmap = await Roadmap.findOne({
            _id: id,   // compare with params id
            userId: userId   // compare with current user id
        })

        if(!roadmap) {
            return res.status(404).json({
            success: false,
            message: "Roadmap not found",
            });
        }

        // we set those data in cache
        await redis.set(`roadmap:${id}`, JSON.stringify(roadmap), "EX", 60*60)

        return res.json({
            success: true,
            fromCache: false,
            data: roadmap,
        });
    } catch (error) {
        console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}