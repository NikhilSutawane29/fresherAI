import React, { useEffect, useState } from "react";
import Step3Report from "../components/interview/Step3Report";
import { useNavigate, useParams } from "react-router-dom";
import { getInterview } from "../src/apis/interview.api";

const InterviewReport = ({ user, setUser }) => {
  const { id } = useParams(); // we get current interviewId
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const navigate = useNavigate();

  // we get our current report through interviewId
  useEffect(() => {
    const fetchReport = async () => {
      const response = await getInterview(id); // those id which we get from params
      const data = response?.interview;
      if (data.status !== "completed") {
        navigate(`/interview/${id}`, { replace: true });
        return;
      }
      setReport(data);
      setLoading(false);
    };
    fetchReport();
  }, [id, navigate]); // means - useEffect works when id is update or some navigate occurs

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07000F] flex items-center justify-center">
        ˆ{/* we create a spining loading circle */}
        <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
      </div>
    );
  }

  if(!report) return null;

  return (
    <Step3Report 
    user={user} 
    setUser={setUser} 
    report={report}
    />
  );
};

export default InterviewReport;
