import { app } from "../config/firebase.js";
import { getAuth } from "firebase-admin/auth";
import User from "../models/user.model.js";
import crypto from "crypto";
import redis, { waitForRedisReady } from "../../../shared/redis/redis.js";

// Google auth controller
export const GoogleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    // All user data comes into decode like user name -> decode.name, same like firebaseuid, email
    // we verify token
    const decoded = await getAuth(app).verifyIdToken(token); // token we get from req.body
    // in decoded we get all user data
    // we "wrap our app" through "getAuth"
    // we verify(verifyIdToken) our token(req.body token) through app(which we initializ in firebase.js through firebase-admin)

    // we check our user is already exists or not through -> unqiue fields like, "firebaseUid, email"
    let user = await User.findOne({
      firebaseUid: decoded.uid,
    }); // we compare Google auth uid with firebase uid(user id)

    // if user not exists already -> we signup our user
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name,
        email: decoded.email,
      });
    }

    // check current user exists or not through session ID
    const sessionId = crypto.randomUUID(); // we generate Session Id

    // ⭐ Note for Google auth controller - find curr user
    // In session Id we don't have any data to find current user, so to access those user, we create a session in Redis through sessionId and we provide value(session id), and to acceess user, we store user data into that session
    // We use Redis -> to find user data from session id
    // we access a value(name session) from session Id
    // in that session we add firebaseuid, name, email, we also have interivew coin
    // we access those session(value) through those sessionId
    // ⭐ TO Access Current User, so we use Redis to create a Session
    // we get sessionID from cookies
    // we set a Session through session id
    await waitForRedisReady();
    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        userId: user._id, // we set database user id
        name: user.name,
        email: user.email,
        interviewCoin: user.interviewCoin,
      }),
      "EX",
      7 * 24 * 60 * 60,
    ); // expire in 7 days(we set in seconds)

    // we store our sessionId in our cookie as a session(name of that sessionId in cookie)
    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // we store sessionId into cookie for 7 days(we convert 7 days into miliseconds by multiplying)
    });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout controller
export const logOut = async (req, res) => {
  try {
    // find session id
    const sessionId = req.cookies?.session;

    // we delete session from redis
    if (sessionId) {
      await redis.del(`session:${sessionId}`); // deleting session id -> so we cannot access current user data
    }

    // we clear cookie
    res.clearCookie("session", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res
      .status(200)
      .json({ success: true, message: "logout successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const sessionId = req.cookies?.session;

    if (!sessionId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const session = await redis.get(`session:${sessionId}`);
    if (!session) {
      return res
        .status(401)
        .json({ success: false, message: "Session Expired" });
    }

    const sessionData = JSON.parse(session);
    const user = await User.findById(sessionData.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const currentUser = {
      userId: user._id,
      name: user.name,
      email: user.email,
      interviewCoin: user.interviewCoin,
    };

    await redis.set(
      `session:${sessionId}`,
      JSON.stringify(currentUser),
      "EX",
      7 * 24 * 60 * 60,
    );

    return res.status(200).json({ success: true, user: currentUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// New
// we decrease our credits
export const useCoins = async (req, res) => {
  try {
    // we get session data, which we want to update
    const sessionId = req.cookies?.session;

    if (!sessionId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // get data through sessionId, which we set in redis
    const session = await redis.get(`session:${sessionId}`);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessionData = JSON.parse(session);

    // we want coins, action(it is required to know for what we use coins like for creating :- resume, interview)  from req.body
    const { coins, action } = req.body;

    if (!coins) {
      return res.status(400).json({
        success: false,
        message: "Coins are required",
      });
    }

    // we find user from session, becasue we need to update those user model after decresing those coins, so we need user data
    const user = await User.findById(sessionData.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // we get user and if user don't have enough coins
    // we compare with coins(those coins which we get from req.body)
    if (user.interviewCoin < coins) {
      return res.status(403).json({
        success: false,
        message: "Not enough interview coins",
        interviewCoin: user.interviewCoin,
      });
    }

    // we get user and if user have enough coins - so we decrease those coins(req.body coins)
    user.interviewCoin -= coins;

    await user.save();

    // NOW till WE update in MONGODB user data, and decrease it's coins in mongodb

    // ⭐
    // we update our session data also, becasue on frontend we show our data through session data
    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        interviewCoin: user.interviewCoin, // updated user coins after decreasing coins
      }),
      "EX",
      7 * 24 * 60 * 60,
    );

    // after returning we can set it in frontend, means we update our "state in frontend"
    return res.status(200).json({
      success: true,
      message: "Interview coins updated successfully",
      action,
      interviewCoin: user.interviewCoin,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// We Update Coins after Verify Payment Successful
export const addCoins = async (req, res) => {
  try {
    // we get session data, which we want to update
    const sessionId = req.cookies?.session;

    if (!sessionId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // get data through sessionId, which we set in redis
    const session = await redis.get(`session:${sessionId}`);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessionData = JSON.parse(session);

    // Find Current User and update it's Interview coins and also upadte it's session in redis
    const { coins } = req.body;

    if (!coins || coins <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid coins are required",
      });
    }

    // we find user from session's data, becasue in session we get current user's Id
    const user = await User.findById(sessionData.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.interviewCoin += Number(coins);

    await user.save();

    // we update user data in session in redis
    // ⭐
    // we update our session data also, becasue on frontend we show our data through session data
    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        interviewCoin: user.interviewCoin, // updated user coins after decreasing coins
      }),
      "EX",
      7 * 24 * 60 * 60,
    );

    return res.status(200).json({
      success: true,
      message: "Coins added successfully",
      interviewCoin: user.interviewCoin,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
