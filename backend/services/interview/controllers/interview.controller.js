import graph from "../graph/graph.js";
import Interview from "../models/interview.model.js";
import redis from "../../../shared/redis/redis.js";

// ⭐ Start Interview controller :-
// api to start - state.action = start
export const startInterview = async (req, res) => {
  try {
    // firstly we want those userId - who creates an interview
    // we get those userId from "gateway - isAuth middleware", which we set in utils folder in "proxy headers"
    // so we get those userId from "headers"
    const userId = req.headers["x-user-id"];

    // we set data from frontend(req.body)
    const { type, role, useResume = false, resume = {} } = req.body;

    // type and role is compulsory
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required to start an interview",
      });
    }

    if (
      !["hr", "technical"].includes(type) ||
      typeof role !== "string" ||
      !role.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Interview type and role are required",
      });
    }

    // after action = start, we show some result
    // basiccally we update all state like - role, type, ...
    const result = await graph.invoke({
      action: "start", // after that in state.action = start -> so interview is started, it gives 6 questions and graph will End
      role,
      type,
      useResume,
      resume,
    });
    // it will return questions in result
    const questions = result.questions;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate Interview questions",
      });
    }

    // after getting questions - we create an Interview inside MongoDB
    const interview = await Interview.create({
      userId,
      type,
      role,
      useResume,
      questions,
      currentQuestion: 0, // 0(idx) because questions is in array and arr starts from 0
      status: "in-progress",
    });
    // after saving in MongoDB - so MongoDB proovides an "Id" for that interview


    await redis.del(`interviews:${userId}`)


    // on Frontend we reach on Interview Page through the id(which is provided by MongoDB) of that interview
    return res.status(200).json({
      success: true,
      interview: interview._id, // we access those MongoDB provided interview id by doing like this -> "._id"
      interviewId: interview._id,
      currentQuestion: 0, // we provide 1st questions which is on 0th idx
      totalQuestions: interview.questions.length,
      questions: interview.questions[0], // 1st question which is on 0th idx
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ⭐ Submit Answer controller :-
// action = feedback
export const submitAnswer = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { interviewId, answer } = req.body;

    if (!interviewId && !answer) {
      return res.status(400).json({
        success: false,
        message: "Interview Id and Answer are required",
      });
    }

    // after submitting answer, we got feedback
    // so for those feedback we update :-
    // by finding those interview which we want to update  and in that those interview's question's answer and it's feedback in MongoDB
    // we use userId to find interview, becasue we want to know that which user's interview is going on
    const interview = await Interview.findOne({
      _id: interviewId, // mongoDB provided id for each interview
      userId, // mongoDB provided id for each user
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // when interview is finallly completed, and still user submit answer
    if (interview.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Interview already completed",
      });
    }

    // we find current question's through it's idx which want to update thoose questions's answer and feedback
    const idx = interview.currentQuestion; // we find those currentQuestion's index
    const currentQuestion = interview.questions[idx]; // we find those currentQuestion which we want to update from "interview.questions" through it's index(at above which we founded)

    if (!currentQuestion) {
      return res.status(400).json({
        success: false,
        message: "Invalid question index",
      });
    }

    // when we get current question - so we save our answer in that current question's user answer(available in questionSchema in model)
    currentQuestion.userAnswer = answer; // answer(which we get from req.body)

    // we check oour interview is completed or not? after submiting any answer
    // because our interview Ends after submitting all 6 questions answers
    const completed =
      interview.currentQuestion + 1 >= interview.questions.length; // + 1 becasue our index starts from 0 and we also get exact question no.

    // Now WE :-
    // Invoke(Call) our Graph
    const result = await graph.invoke({
      // in that we update our State's object
      action: "feedback",

      question: currentQuestion.question,

      answer,

      difficulty: currentQuestion.difficulty,

      completed,

      role: interview.role,

      type: interview.type,

      questions: interview.questions,
    });

    // we update current question
    currentQuestion.feedback = result.feedback; // it can update all our question Schema feedback object

    interview.currentQuestion++; // we go on next question

    // when completed is true, so it will go on Summaru Agent and we get data in "summary.report", so we update our report
    // in our report data we get all like - overallScore, summary, strengths, ...
    // in above we get result by calling(invoking) our graph
    if (completed) {
      interview.status = "completed";

      interview.overallScore = result.report.overallScore;

      interview.summary = result.report.summary;

      interview.strengths = result.report.strengths;

      interview.weaknesses = result.report.weaknesses;

      interview.recommendations = result.report.recommendations;

      await interview.save();

      await redis.del(`interviews:${userId}`)

      return res.status(200).json({
        success: true,
        completed: true,
        interview,
        feedback: result.feedback,
      });
    }

    // when interview not completed - so we only update it's feedback
    await interview.save();

    await redis.del(`interviews:${userId}`)

    return res.status(200).json({
      success: true,
      completed: false,
      currentQuestion: interview.currentQuestion,
      // we provide next question
      question: interview.questions[interview.currentQuestion],

      feedback: result.feedback,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ⭐ Controller - to get interview
// we find our interview thorugh interview Id
// Becasue in above we already start interview, but we want to know that - which  interview we want to start
export const getInterview = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { id } = req.params; // current interview Id, which we start

    // we find those interview
    // in that interview - in this their are all questions, means :-
    // after starting an interview and we submit our answer -> in that question we update feedback, answer
    // ⭐ so basically we find those question
    const interview = await Interview.findOne({
      _id: id, // id(means those which we get from "req.params")
      userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // when we get interview
    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ⭐ Controller to find current User all interviews
export const getAllInterviews = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    const cache = await redis.get(`interviews:${userId}`);

    // we get data from Redis
    if (cache) {
      console.log("Data served from redis");
      return res.status(200).json(JSON.parse(cache));
    }

    // if we not get data from redis, so in that we find data from Database and set those data in Redis
    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
    // we find all interviews of particular user through user's Id
    // createdAt: -1 -> newly created interview comes first

    // finding completed Interview by all interview's status either it would be "completed" or "in progress"
    const completed = interviews.filter((item) => item.status === "completed");

    // finding total questions
    const totalQuestions = interviews.reduce(
      (sum, item) => sum + item.questions.length,
      0,
    );

    // finding Average Score - means overall score of all interviews
    // we calculate overall score for only completed interviews
    const averageScore =
      completed.length > 0
        ? Number(
            completed.reduce((sum, item) => sum + item.overallScore, 0) /
              completed.length,
          ).toFixed(1)
        : 0;

    const stats = {
      totalInterviews: interviews.length,
      totalQuestions,
      completed: completed.length,
      averageScore,
    };

    const getAverageData = (list) => {
      if (!list.length) {
        return [
          // we return empty feedback data
          { skill: "Correctness", score: 0 },
          { skill: "Clarity", score: 0 },
          { skill: "Relevance", score: 0 },
          { skill: "Detail", score: 0 },
          { skill: "Efficiency", score: 0 },
          { skill: "Communication", score: 0 },
          { skill: "Problem solving", score: 0 },
          { skill: "Creativity", score: 0 },
        ];
      }

      const total = {
        correctness: 0,
        clarity: 0,
        relevance: 0,
        detail: 0,
        efficiency: 0,
        communication: 0,
        problemSolving: 0,
        creativity: 0,
      };

      list.forEach((interview) => {
        // here interview acts as an Index
        interview.questions.forEach((q) => {
          // we access all those 6(in single interview their are 6 questions) interview questions through "q(idx)"

          // we add and updaate feedback data(which is avaible in each question) into "total data"
          total.correctness += q.feedback.correctness || 0;
          total.clarity += q.feedback.clarity || 0;
          total.relevance += q.feedback.relevance || 0;
          total.detail += q.feedback.detail || 0;
          total.efficiency += q.feedback.efficiency || 0;
          total.communication += q.feedback.communication || 0;
          total.problemSolving += q.feedback.problemSolving || 0;
          total.creativity += q.feedback.creativity || 0;
        });
      });

      // finding eeach interview Average score
      const count = list.reduce((sum, item) => sum + item.questions.length, 0);

      if (count === 0) {
        return [
          { skill: "Correctness", score: 0 },
          { skill: "Clarity", score: 0 },
          { skill: "Relevance", score: 0 },
          { skill: "Detail", score: 0 },
          { skill: "Efficiency", score: 0 },
          { skill: "Communication", score: 0 },
          { skill: "Problem solving", score: 0 },
          { skill: "Creativity", score: 0 },
        ];
      }

      // Get all Average score
      return [
        {
          skill: "Correctness",
          score: Math.round(total.correctness / count),
        },
        {
          skill: "Clarity",
          score: Math.round(total.clarity / count),
        },
        {
          skill: "Relevance",
          score: Math.round(total.relevance / count),
        },
        {
          skill: "Detail",
          score: Math.round(total.detail / count),
        },
        {
          skill: "Efficiency",
          score: Math.round(total.efficiency / count),
        },
        {
          skill: "Communication",
          score: Math.round(total.communication / count),
        },
        {
          skill: "Problem solving",
          score: Math.round(total.problemSolving / count),
        },
        {
          skill: "Creativity",
          score: Math.round(total.creativity / count),
        },
      ];
    };

    // we find Interview Type - "Technical" or "Hr"
    const technicalInterviews = completed.filter(
      (item) => item.type === "technical",
    );
    const hrInterviews = completed.filter((item) => item.type === "hr");

    // we provide those interview type in params as a (list) => which we define in those function :- getAverageData(list)
    const technicalData = getAverageData(technicalInterviews);
    const hrData = getAverageData(hrInterviews);

    const technicalCount = technicalInterviews.length

    const hrCount = hrInterviews.length

    // we set data in redis
    const payload = {
      success: true,
      interviews,   // all interviews of current user
      stats,
      technicalData,
      hrData,
      technicalCount,
      hrCount
    }
    // we set those payload data in Redis, means we set data in "cache"
    await redis.set(`interviews:${userId}`, JSON.stringify(payload), "EX", 600)

    return res.status(200).json(payload);  // we return from MongoDB


  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};










// Whole flow :-

//                +-----------------------+
//                |      Frontend UI      |
//                | Start / Submit Answer |
//                +-----------------------+
//                            |
//                            v
//                +-----------------------+
//                |  Interview Controller |
//                +-----------------------+
//                            |
//                   graph.invoke(state)
//                            |
//                            v
//                +-----------------------+
//                |       LangGraph       |
//                +-----------------------+
//                            |
//              +-------------+-------------+
//              |                           |
//        action=start               action=feedback
//              |                           |
//              v                           v
//      +----------------+          +---------------+
//      | Interview Node |          | Feedback Node |
//      +----------------+          +---------------+
//              |                           |
//              v                           v
//      +----------------+          +---------------+
//      |Interview Agent |          |Feedback Agent |
//      +----------------+          +---------------+
//              |                           |
//              v                           v
//           OpenAi LLM                    OpenAi LLM
//              |                           |
//              v                           v
//       [Questions JSON]            [Feedback JSON]
//              |                           |
//              +-------------+-------------+
//                            |
//                            v
//                  +-------------------+
//                  |  completed=true ? |
//                  +-------------------+
//                            |
//                           Yes
//                            |
//                            v
//                  +-------------------+
//                  |   Summary Node    |
//                  +-------------------+
//                            |
//                            v
//                  +-------------------+
//                  |   Summary Agent   |
//                  +-------------------+
//                            |
//                            v
//                         OpenAi LLM
//                            |
//                            v
//                   [Final Report JSON]
