import express from "express";
import dotenv from "dotenv";
dotenv.config();
import proxy from "express-http-proxy";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { getCurrentUser } from "./controllers/user.controller.js";
import { isAuth } from "./middleware/isAuth.js";
import { proxyWithHeaders } from "./utils/proxyWithHeaders.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(morgan("dev")); // It shows any gatway request on terminal
app.use(cookieParser()); // to cookies in correct way

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Hello from Gateway");
});

// Microservice - any request comes on this "Gateway" and then they decide to send those request on particular services

// 1 - here req comes on this -> /api/auth -> Gateway sends those re to "Auth service"
// we want to access our service api's through Gateway
// so for that we give our service url into proxy
app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL));

// 2 - we access our resume through gateway
app.use(
  "/api/resume",
  isAuth,
  proxyWithHeaders(process.env.RESUME_SERVICE_URL),
);
/* 
when user request on this -> /api/resume

- runs isAuth middleware, and we get all users data(all users session) in "req.user"
- those "users session" is accessed by "proxyWithHeaders" -> inside "srcReq.user" 
- in "proxyReqOpts" in headers we update headers by adding user's Id

=> Means when we call on /api/resume => we get "data in headers"
 - user's id we get from /auth
 - then -> update those id in headers by calling proxyWithHeaders()
 - we access those headers in RESUME_SERVICE_URL
*/

// 3 - we access our interview through gateway
app.use(
  "/api/interview",
  isAuth,
  proxyWithHeaders(process.env.INTERVIEW_SERVICE_URL),
);


// access roadmap service through Gateway
app.use("/api/roadmap", isAuth, proxyWithHeaders(process.env.ROADMAP_SERVICE_URL))



// access billing service through Gateway
app.use("/api/billing", isAuth, proxyWithHeaders(process.env.BILLING_SERVICE_URL))


// api for curr user
app.get("/api/me", isAuth, getCurrentUser);
// what happens flow of request :-
/*
    when we req on -> /api/me => withcredentails: true

    - now we access cookies in isAuth middleware

    isAuth(middleware)
    -> in that cookies we have session, and it returns those whole session data in req.user
    -> call next()

    getcurrentUser(controller)
    -> we access those req.user in getcurrentUser(controller) and we return our user session to frontend
*/




app.listen(PORT, (req, res) => {
  console.log(`Gateway started ${PORT}`);
});
