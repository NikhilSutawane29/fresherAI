import { Annotation } from "@langchain/langgraph";

// State for LangGraph
// state value tells to go on which node

// we build custome State - after that we send those to every node in langrapgh

const InterviewState = Annotation.Root({  // becasue we making a "Custome State" so we use Annotation.Root() for langgraph state

// we use Annotation to save our custome value

// so below all are our Custome States
  action: Annotation(),

  type: Annotation(),

  role: Annotation(),

  useResume: Annotation(),

  resume: Annotation(),

  questions: Annotation(),  // all 6 questions are there

  question: Annotation(),  // it defines 1 current question

  answer: Annotation(),  // curr question ans

  difficulty: Annotation(),  // curr question difficulty

  feedback: Annotation(), // curr question feedback

  report: Annotation(), // summary 

  completed: Annotation(),  // after completing all 6 questions - we make that "completed(State) = true" 
  // after that we go on "Summary Node"
});


export default InterviewState;