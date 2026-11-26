
import express from "express"
import { GoogleAuth, addCoins, getCurrentUser, logOut, useCoins } from "../controllers/auth.controller.js"

const authRouter = express.Router()


// post route for login
authRouter.post("/login", GoogleAuth)


// get route for logout
authRouter.get("/logout", logOut)

authRouter.get("/current-user", getCurrentUser)

// post route for decreasing coins
authRouter.post("/use-coins", useCoins)

authRouter.post("/add-coins", addCoins)


export default authRouter 