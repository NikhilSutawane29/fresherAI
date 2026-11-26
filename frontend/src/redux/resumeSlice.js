
import { createSlice } from "@reduxjs/toolkit";

const resumeSlice = createSlice({
    name: "resume",
    initialState: {
        resume: null
    },
    reducers: {  // in reducers we set our data
        setResume(state, action) {
            state.resume = action.payload  // we update the initial state of resume through "setResume", means we update/change the data in that payload 
        }
    }
})

export const { setResume } = resumeSlice.actions  // we provide actions because - our actions are updates/changes

export default resumeSlice.reducer