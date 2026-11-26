import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiAlertCircle,
  FiTrendingUp,
  FiUploadCloud,
  FiUser,
  FiZap,
} from "react-icons/fi";
import api from "../src/utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { setResume } from "../src/redux/resumeSlice";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { useCoins } from "../src/apis/user.api";

// Score ring component - #84cc16
const ScoreRing = ({ score }) => {
  const color = score >= 75 ? "#7c3aed" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      {/* we create a circle */}
      <RadialBarChart
        width={110}
        height={110}
        cx={55} // shows center of circle from - x axis
        cy={55} // shows center of circle from - y axis
        innerRadius={40} // shows inner thickness of circle
        outerRadius={53} // shows outer thickness of circle
        startAngle={90}
        endAngle={-270}
        data={[{ value: score, fill: color }]}
        barSize={8} // thickness of ring
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar
          background={{ fill: "#e5e7eb" }}
          dataKey="value"
          cornerRadius={8}
        />
      </RadialBarChart>

      <div className="absolute flex items-center">
        <span className="text-lg text-white leading-none font-bold">
          {score}
        </span>
        <span className="text-[9px] mt-0.5 text-gray-200">/100</span>
      </div>
    </div>
  );
};

// New component
const Tag = ({ text, color }) => {
  const styles = {
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    red: "bg-red-50 text-red-700 border-red-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };

  return (
    <div
      className={`text-[10px] px-1.5 py-1 rounded-md border font-medium ${styles[color]}`}
    >
      {text}
    </div>
  );
};

// Nav component
const Navbar = ({ label }) => {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-20 border-b border-black/8 bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-start px-3 sm:px-5">
        <div
          onClick={() => navigate("/dashboard")}
          className="flex cursor-pointer items-center gap-1.5"
        >
          <span className="text-sm font-extrabold sm:text-base text-[#0A0A0A]">
            FresherAI
          </span>
          <span className="hidden rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-black/50 sm:block">
            {label}
          </span>
        </div>
      </div>
    </motion.nav>
  );
};

const Scorer = ({ user, setUser }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch(); // through those "dispatch(coming from react-redux)" we update our setResume

  const { resume } = useSelector((state) => state.resume); // we access those data using "useSelector"

  // we fetch our upload backend Api
  const uploadResume = async () => {
    if (!file) {
      alert("Please select a PDF");
      return;
    }

    try {
      setLoading(true);

      try {
        // fetching use coins api - which is responsible to decrese our coins
        const coinResponse = await useCoins({
          coins: 10,
          action: "resume-scorer",
        });

        // we update our interview coins after decreasing coins - means we update our current user with new session on Frontend
        setUser((prev) => ({
          ...prev, // we put old or remaining(...prev) all values are same
          interviewCoin: coinResponse?.interviewCoin, // we update interview coin
        }));
      } catch (error) {
        setLoading(false);
        alert("Failed to use coins.");
        return;
      }

      // FormData we create because if their is some file, image in form, so we send those Form data to "Resume Service Backend" from Frontend(using FormData)
      const formData = new FormData();
      formData.append("resume", file); // "resume(is just a name)" and file(is those which we we set[like setFile])

      // fetch api(axios api which we set in utils folder - in that we already defined serverUrl, withcred: true), so we access those Api by just writing => api
      const response = await api.post("/api/resume/upload", formData);

      dispatch(setResume(response?.data?.data)); // after getting response -> we update data in our setResume(come from ../src/redux/resumeSlice) through those "dispatch hook"

      setLoading(false);
    } catch (error) {
      console.log(error);
      alert("Upload Failed");
      setLoading(false);
    }
  };

  // scorer section - step-2
  if (resume)
    return (
      <div className="min-h-screen bg-white text-[#0A0A0A]">
        <Navbar label="Resume Scorer" />

        <section className="max-w-6xl mx-auto px-3 pt-18 sm:pt-20 pb-8 space-y-3">
          {/* header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] text-black/40 tracking-widest uppercase mb-0.5">
                Resume Analysis
              </p>
              <h2 className="text-lg font-bold">{resume?.name}</h2>
            </div>

            <button
              onClick={() => dispatch(setResume(null))}
              className="text-[10px] sm:text-xs text-black/50 hover:text-[#0A0A0A] border border-black/15 hover:border-black/35 px-2.5 py-1 rounded-lg transition-colors"
            >
              Re-upload
            </button>
          </div>

          {/* scorer main div */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-4 sm:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

            {/* score */}
            <div className="relative">
              <ScoreRing score={resume?.score} />
            </div>

            {/*  */}
            <div className="relative">
              <p className="text-white/50 text-xs mb-0.5">Resume Score</p>
              <p className="text-lg sm:text-xl font-bold mb-1.5 text-white">
                {resume.score >= 75
                  ? "Strong"
                  : resume.score >= 50
                    ? "Average"
                    : "Needs Work"}
              </p>
              <div className="flex items-center gap-1.5">
                <FiUser className="text-purple-400 text-xs" />
                <span className="text-xs text-purple-300">
                  {resume?.suggestedRole}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Ai Showing strength and weaknesses based on Resume */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.07 }}
              className="relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
              <div className="relative flex items-center gap-1.5 mb-2.5">
                <FiAlertCircle className="text-green-400" size={14} />
                <span className="text-xs font-semibold text-white">
                  Strength
                </span>
              </div>

              <div className="relative flex flex-wrap gap-1.5">
                {resume?.strengths?.map((s) => (
                  <Tag key={s} text={s} color="green" />
                ))}
              </div>
            </motion.div>

            {/* Weaknesses */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.07 }}
              className="relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
              <div className="relative flex items-center gap-1.5 mb-2.5">
                <FiAlertCircle className="text-yellow-400" size={14} />
                <span className="text-xs font-semibold text-white">
                  Weaknesses
                </span>
              </div>

              <div className="relative flex flex-wrap gap-1.5">
                {resume?.weaknesses?.map((s) => (
                  <Tag key={s} text={s} color="yellow" />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Missing Skills */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.09 }}
            className="relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-1.5 mb-2.5">
              <FiZap className="text-red-400" size={14} />
              <span className="text-xs font-semibold text-white">
                Missing Skills
              </span>
            </div>

            <div className="relative flex flex-wrap gap-1.5">
              {resume?.missingSkills?.map((s) => (
                <Tag key={s} text={s} color="red" />
              ))}
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-1.5 mb-2.5">
              <FiTrendingUp className="text-purple-400" size={14} />
              <span className="text-xs font-semibold text-white">
                Recommendations
              </span>
            </div>

            <div className="relative flex flex-wrap gap-1.5">
              {resume?.recommendations?.map((s) => (
                <Tag key={s} text={s} color="purple" />
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    );

  // upload section - step-1
  return (
    <div className="min-h-screen bg-white text-[#0A0A0A]">
      <Navbar label={"Resume Scorer"} />

      <section className="flex min-h-screen items-center justify-center px-3 pt-18 pb-6">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] sm:p-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white[0.08] via-transparent to-transparent pointer-events-none" />

          <p className="relative text-[10px] text-white/40 tracking-widest uppercase mb-1.5">
            Step 1 to 2
          </p>

          {/* we create a line */}
          <div className="relative w-full h-1 bg-white/10 rounded-full mb-4">
            <div className="h-1 bg-white rounded-full w-1/2" />
          </div>

          <h2 className="relative text-lg font-bold text-white mb-1">
            Upload Your Resume
          </h2>

          <p className="relative text-white/45 text-xs mb-4">
            We'll score it and give you actionable feedback
          </p>

          <label
            className={`relative flex flex-col items-center justify-center w-full h-40 sm:h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-colors
          ${
            file
              ? "border-white/40 bg-white/[0.06]"
              : "border-white/15 bg-white/[0.03] hover:border-white/30"
          }`}
          >
            <FiUploadCloud
              className={`text-4xl sm:text-5xl mb-2.5 ${file ? "text-white" : "text-white/30"}`}
            />

            <p className="text-xs font-medium text-white/80">
              {file ? file.name : "Click or drag PDF here"}
            </p>
            <p className="text-[10px] text-white/35 mt-1">
              PDF only · Max 20MB
            </p>

            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])} // those file we select firstly(0th file) so it(file) sets in "setFile"
            />
          </label>

          <motion.button
            onClick={uploadResume}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.97 }}
            disabled={!file || loading}
            className="relative mt-4 w-full h-10 rounded-xl font-semibold text-xs bg-white text-[#0A0A0A] shadow-[0_4px_14px_rgba(255,255,255,0.15)] hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default Scorer;
