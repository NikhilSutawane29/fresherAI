// middleware to get current user - through it's session id

import redis from "../../shared/redis/redis.js";

export const isAuth = async (req, res, next) => {
  try {
    // get session id from cookies
    const sessionId = req.cookies?.session;
    // why we get sessionId from cookies ? => becasue we store sessionId in cookies

    if (!sessionId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // when we get sessionId(curr user)
    const session = await redis.get(`session:${sessionId}`); // session is our name, sessionId is a key, through that key(sessionId) we get access of those session(which we set in redis)

    // when we cannot get session from redis through sessionId(key)
    if (!session) {
      return res.status(401).json({ message: "Session Expired" });
    }

    req.user = JSON.parse(session); // we get current user's whole session data like -> name, userId,email, interviewCoin

    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
