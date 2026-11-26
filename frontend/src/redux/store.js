
import { configureStore } from "@reduxjs/toolkit"
import resumeSlice from "./resumeSlice.js"

export const store = configureStore({
    reducer: {
        resume: resumeSlice,
    },
})










/*
    Note - why we use Redux in React ?
    
    - because for State management for setting data, means we use "useState" to set our data in only for those particular file

    - through those Redux we set our data in all our App 

    - we "set our data" using "useDispatch"

    - if we want to "acccess" those "set data" in "another file" so we use -> "useSelector"

*/


