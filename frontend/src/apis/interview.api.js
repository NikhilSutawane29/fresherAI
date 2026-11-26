import api from "../utils/axios.js";

export const startInterview = async (data) => {
  const response = await api.post("/api/interview/start", data);
  return response.data;
};


 

// we get interview through those interviewId
export const getInterview = async (id) => {
  try {
    const response = await api.get(`/api/interview/${id}`); // it takes those thing in params
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};





// Submit Answer Function - When we click "Submit Answer" btn
export const submitAnswer = async (data) => {
  const response = await api.post(`/api/interview/answer`, data);
  return response.data;
};



// fetching get all current user's interviews
export const getAllInterviews = async () => {
  try {
    const response = await api.get(`/api/interview/all`)
    console.log(response.data)
    return response.data
  } catch (error) {
    console.log(error);
    return null;
  }
}