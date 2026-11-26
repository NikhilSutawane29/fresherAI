import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInterview } from "../src/apis/interview.api";
import Step2Interview from "../components/interview/Step2Interview";

const InterviewPage = ({user, setUser}) => {
  const { id } = useParams(); // we get current interviewId
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const navigate = useNavigate();

  // we get our current interview through interviewId
  useEffect(() => {
    const fetchInterview = async () => {
      const response = await getInterview(id); // those id which we get from params
      const data = response?.interview;
      if (data.status === "completed") {
        navigate(`/interview/${id}/report`, { replace: true });
        return;
      }
      setInterview(data)
      setLoading(false)
    };
    fetchInterview()
  }, [id, navigate]); // means - useEffect works when id is update or some navigate occurs

  if(loading) {
    return (
      <div className="min-h-screen bg-[#07000F] flex items-center justify-center">ˆ
      {/* we create a spining loading circle */}
        <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin">
        </div>
      </div>
    )
  }

  if(!interview) {
    return null;
  }

  return (
    <Step2Interview 
      interviewData={{
        interviewId: interview._id,
        currentQuestion: interview.currentQuestion,
        totalQuestions: interview.questions.length,
        question: interview.questions[interview.currentQuestion],
      }} user={user}
    />
  )
};

export default InterviewPage;
