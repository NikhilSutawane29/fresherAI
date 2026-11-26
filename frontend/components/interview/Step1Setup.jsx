import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiFileText,
  FiUploadCloud,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useCoins } from "../../src/apis/user.api";
import api from "../../src/utils/axios.js";
import { setResume } from "../../src/redux/resumeSlice.js";
import { startInterview } from "../../src/apis/interview.api.js";

const Step1Setup = ({ user, setUser }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { resume } = useSelector((state) => state.resume); // we get resume from redux
  const [role, setRole] = useState("");
  const [type, setType] = useState("technical");
  const [useResume, setUseResume] = useState(!!resume); // !! means we check those resume data in boolean form :-
  //  means if resume data is their -> returns true
  //  means if resume data is not their -> returns false

  // we want to set some value, so we use "useState"
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);

  // we fetch our upload backend Api
  const uploadResume = async () => {
    if (!file) {
      alert("Please select a PDF");
      return;
    }

    try {
      setUploading(true);

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
        setUploading(false);
        alert("Failed to use coins.");
        return;
      }

      // FormData we create because if their is some file, image in form, so we send those Form data to "Resume Service Backend" from Frontend(using FormData)
      const formData = new FormData();
      formData.append("resume", file); // "resume(is just a name)" and file(is those which we we set[like setFile])

      // fetch api(axios api which we set in utils folder - in that we already defined serverUrl, withcred: true), so we access those Api by just writing => api
      const response = await api.post("/api/resume/upload", formData);

      dispatch(setResume(response?.data?.data)); // after getting response -> we update data in our setResume(come from ../src/redux/resumeSlice) through those "dispatch hook"

      setUploading(false);
    } catch (error) {
      console.log(error);
      alert("Upload Failed");
      setUploading(false);
      setFile(null);
    }
  };

  // function to call api - /api/interview/start
  const start = async () => {
    setStarting(true);
    try {
      const response = await startInterview({ role, type, useResume, resume });
      if (!response?.interviewId) {
        throw new Error(response?.message || "Failed to start the interview.");
      }

      const coinResponse = await useCoins({
        coins: 20,
        action: "start-interview",
      });

      setUser((prev) => ({
        ...prev,
        interviewCoin: coinResponse?.interviewCoin,
      }));

      navigate(`/interview/${response.interviewId}`);
    } catch (error) {
      console.error("Failed to start interview", error);
      setStarting(false);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to use coins.",
      );
      return;
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-3 sm:p-5">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-4xl bg-[#0E1016] border border-white/10 rounded-2xl sm:rounded-[24px] overflow-hidden grid lg:grid-cols-[40%_60%] shadow-[0_0_60px_rgba(255, 255, 255, .03)]"
      >
        {/* left side div - covers 40% area in lg devices */}
        <div className="p-5 sm:p-7 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-start gap-4">
          <div>
            <div
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 cursor-pointer"
            >
              <FiArrowLeft size={12} />
              <span className="text-xs text-zinc-300">Back</span>
            </div>

            <h2 className="mt-4 text-xl sm:text-2xl font-bold text-white leading-snug">
              Welcome back, <br />
              {user?.name}
            </h2>

            <p className="mt-2 text-xs sm:text-sm leading-6 text-zinc-400">
              Practice realistic AI Interview, receive instant feedback, and
              improve before your next job interview.
            </p>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {[
              "Personalized AI Questions",
              "Resume Based Interview",
              "Detailed Performance Report",
              "Real Interview Experience",
            ].map((item, idx) => (
              <motion.div
                whileHover={{ x: 4 }}
                key={idx}
                className="flex items-center rounded-xl border border-white/5 bg-white/[0.03] p-3 gap-3"
              >
                <div className="w-7 h-7 shrink-0 bg-white flex items-center justify-center rounded-lg">
                  <FiCheck className="text-black" size={13} />
                </div>
                <span className="text-xs sm:text-sm text-zinc-300">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* right side div - covers 60% area in lg devices */}
        <div className="p-5 sm:p-7 flex flex-col">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Start Interview
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Configure your interview preferences.
            </p>
          </div>

          <div className="mt-5 flex-1 space-y-4 overflow-y-auto">
            {/* role */}
            <div>
              <label className="text-xs font-medium text-zinc-400">
                Target Role
              </label>
              <div className="mt-1.5 relative">
                <FiBriefcase
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  size={14}
                />
                <input
                  onChange={(e) => setRole(e.target.value)}
                  value={role}
                  placeholder="Backend Developer"
                  type="text"
                  className="w-full h-11 rounded-xl bg-[#17181E] border border-white/10 pl-10 pr-4 text-sm text-white outline-none focus:border-white/30 transition"
                />
              </div>
            </div>

            {/* type */}
            <div>
              <label className="text-xs font-medium text-zinc-400">
                Interview Type
              </label>
              <div className="mt-1.5 flex rounded-xl bg-[#17181E] p-1 border border-white/10">
                {["technical", "hr"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setType(item)}
                    className={`flex-1 h-9 rounded-lg text-xs sm:text-sm font-medium capitalize transition-all ${type === item ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* resume toggle */}
            <div className="rounded-xl border border-white/10 bg-[#17181E] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-white">Use Resume</h2>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    AI will personalize questions using your resume.
                  </p>
                </div>

                <button
                  onClick={() => setUseResume(!useResume)}
                  className={`relative shrink-0 w-12 h-7 rounded-full transition ${useResume ? "bg-white" : "bg-zinc-700"}`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-black transition-all ${useResume ? "left-5.5" : "left-0.5"}`}
                  />
                </button>
              </div>
            </div>

            {/* some message shows if resume is available */}
            {resume && useResume && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border border-green-500/20 bg-green-500/5 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center">
                    <FiFileText size={15} className="text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white">
                      Resume Ready{" "}
                      <span className="text-gray-400">
                        ({resume?.suggestedRole})
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Resume detected successfully.
                    </p>
                  </div>

                  <FiCheckCircle
                    size={18}
                    className="text-green-400 shrink-0"
                  />
                </div>
              </motion.div>
            )}

            {/* upload resume section */}
            {useResume && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border-2 border-dashed border-white/10 bg-[#17181E p-4"
              >
                <label className="cursor-pointer flex flex-col items-center">
                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
                    <FiUploadCloud size={20} className="text-black" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-white">
                    Upload Resume
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 text-center">
                    {resume
                      ? "Resume detected. Upload a new resume anytime to update your interview questions."
                      : "Upload your resume to generate personalized interview questions."}
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0]) setFile(e.target.files[0]);
                    }}
                  />
                </label>

                {file && (
                  <div className="mt-4">
                    <div className="rounded-lg bg-black/20 border-white/10 p-2.5">
                      <p className="text-xs text-zinc-300 truncate">
                        {file.name}
                      </p>
                    </div>

                    <button
                      onClick={uploadResume}
                      disabled={uploading}
                      className="mt-3 w-full h-10 rounded-xl bg-white text-black text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
                    >
                      {uploading ? "uploading..." : "upload"}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/*  */}
          <motion.button
            onClick={start}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={!role || starting || (useResume && !resume)}
            className="mt-5 h-12 bg-white font-semibold rounded-xl text-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition"
          >
            {starting ? (
              "Starting Interview..."
            ) : (
              <>
                Start Interview <FiArrowRight size={15} />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Step1Setup;
