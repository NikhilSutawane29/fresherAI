import { interviewAgent } from "../agents/interview.agent.js";
import { feedbackAgent } from "../agents/feedback.agent.js";
import { summaryAgent } from "../agents/summary.agent.js";

// we use our Agent with each and every Nodes

// at our Node we get data from State(which we define in state.js)

export const interviewNode = async (state) => {
  // we use our interview agent

  // we also need all questions data - so we update questions data in our "State"
  const questions = await interviewAgent({
    // here we provide those data which we get from "State"
    role: state.role,
    type: state.type,
    useResume: state.useResume,
    resume: state.resume,
  });

  return {
    questions, // after that it can automatically update in State
  };
};







// feedback node - it can also take our custome state in params
export const feedbackNode = async (state) => {
  const feedback = await feedbackAgent({
    question: state.question, // curr question
    answer: state.answer,
    difficulty: state.difficulty,
  });

  return {
    feedback, // feedback is also update in state
  };
};








// summary Node
// we gave report name becasue in state we also give report name
export const summaryNode = async (state) => {
  const report = await summaryAgent({
    role: state.role,
    type: state.type,
    questions: state.questions,
  });

  return {
    report,
  };
};




// Note - in every Node those data will return - we save all data in MongoDB  after returning
