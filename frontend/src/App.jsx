import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import { useState } from "react";
import { useEffect } from "react";
import { getCurrentUser } from "./apis/user.api";
import Scorer from "../pages/Scorer";
import { getResume } from "./apis/resume.api";
import { useDispatch } from "react-redux";
import { setResume } from "./redux/resumeSlice";
import ResumeBuilder from "../pages/ResumeBuilder";
import InterviewStart from "../pages/InterviewStart";
import InterviewPage from "../pages/InterviewPage";
import InterviewReport from "../pages/InterviewReport";
import Roadmap from "../pages/Roadmap";
import Billing from "../pages/Billing";
import api from "./utils/axios";

const App = () => {
  const [user, setUser] = useState(null); // for current user
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch()  // for getting resume data through redux

  // when we cannot find curr user so loading is true, otherwise it would be false

  useEffect(() => {
    api.get("/api/wake").catch(() => {});
  }, []);


// we get current user whenever we are loggedin
  useEffect(() => {
    const getUser = async () => {
      const data = await getCurrentUser(); // in data all session data is their = current user
      setUser(data?.user ?? null); // unauthenticated users receive a normal 401 response
      setLoading(false); // false loading after getting current user data
    };

    getUser(); // when this func calls, so automatically our set loading is false
  }, []);




  // we get loggedin user's resume data, whenever user are loggedin
  // when we restart or refresh -> still we get resume data
  useEffect(() => {
    const getResumeData = async () => {
      const result = await getResume()
      dispatch(setResume(result?.data))
    }

    getResumeData()
  }, [])


  if (loading) {
    return (
      <div className="top-0 left-0 w-full z-[9999]">
        <div className="h-1 bg-black animate-pulse w-full"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Home setUser={setUser} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/scorer"
          element={
            user ? (
              <Scorer user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* resume route */}
        <Route
          path="/resume"
          element={
            user ? (
              <ResumeBuilder user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* interview routes  */}
        <Route
          path="/interview"
          element={
            user ? (
              <InterviewStart user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/interview/:id"  // through those id we get our current interview, which we show in Step2-component
          element={
            user ? (
              <InterviewPage user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/interview/:id/report"
          element={
            user ? (
              <InterviewReport user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/roadmap"
          element={
            user ? (
              <Roadmap user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/billing"
          element={
            user ? (
              <Billing user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/pricing" element={<Navigate to="/billing" replace />} />
      </Routes>
    </>
  );
};

export default App;
