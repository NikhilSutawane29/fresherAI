// Router checks below conditions through "state"
// 1st Router checks for - action is -> start(start interview) or feedback
// 2nd Router checks for - action is -> interview not completed(we are on current question) or interview completed(after attending and submitting all 6 questions)

import { END, START, StateGraph } from "@langchain/langgraph";
import InterviewState from "./state.js";
import { feedbackNode, interviewNode, summaryNode } from "./nodes.js";

function router(state) {
  switch (state.action) {
    case "start":
      return "interviewAgent";

    case "feedback":
      return "feedbackAgent";

    default:
      return END;
  }
}

// feedback router
function feedbackRouter(state) {
  if (state.completed) {
    return "summaryAgent";
  }

  return END;
}



// we create Graph :-
const graph = new StateGraph(InterviewState)
  // we add nodes
  .addNode("interviewAgent", interviewNode) // name of that node is "interviewAgent"
  .addNode("feedbackAgent", feedbackNode)
  .addNode("summaryAgent", summaryNode)

  //⭐ we add routes start and then we also add condition - we add conditional Edges for Interview Agent for Start
  .addConditionalEdges(
    START,
    router, // check condition means where to reach
    {
      // so router checks based on condition, on which node/agent we want to go
      interviewAgent: "interviewAgent",
      feedbackAgent: "feedbackAgent",
    },
  )


  // we add Edge :-
  .addEdge(
    "interviewAgent",
    END,
    // means we go from interviewAgent to END -
    // END becasue :- we interview start -> interview agent gives 6 questions -> END
  )

  //⭐ Conditional Edge for Feedback Agent
  .addConditionalEdges(
    "feedbackAgent",
    feedbackRouter, // it checks where it goes based on condition
    {
      summaryAgent: "summaryAgent", // it goes when all 6 questions are done
      [END]: END, // it goes when current question is going on
    },
  )
  // condition to reach from summaryAgent to End
  .addEdge("summaryAgent", END)
  .compile()


  export default graph;















//   whole Graph Flow :-

//                       START
//                         |
//                         v
//                graph.invoke(state)
//                         |
//                         v
//               +--------------------+
//               |       Router       |
//               | Check state.action |
//               +--------------------+
//                         |
//              +----------+----------+
//              |                     |
//       action = "start"      action = "feedback"
//              |                     |
//              v                     v
//      +----------------+    +---------------+
//      | Interview Node |    | Feedback Node |
//      +----------------+    +---------------+
//              |                     |
//              v                     v
//      +----------------+    +---------------+
//      |Interview Agent |    |Feedback Agent |
//      +----------------+    +---------------+
//              |                     |
//              v                     v
//        OpenAI LLM              OpenAI LLM
//              |                     |
//              v                     v
//      Generate Questions    Generate Feedback
//              |                     |
//              v                     v
//             END           +-----------------+
//                           | Feedback Router |
//                           |   completed?    |
//                           +-----------------+
//                                    |
//                          +---------+---------+
//                          |                   |
//                  completed = false   completed = true
//                          |                   |
//                          v                   v
//                         END          +----------------+
//                                      |  Summary Node  |
//                                      +----------------+
//                                              |
//                                              v
//                                      +----------------+
//                                      | Summary Agent  |
//                                      +----------------+
//                                              |
//                                              v
//                                           OpenAI LLM
//                                              |
//                                              v
//                                       Generate Report
//                                              |
//                                              v
//                                             END
