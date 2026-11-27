
import axios from "axios"

// we define to axios what's in an api we want to add like => add serverurl, withcredentials: true, etc, ....

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:7000", // gateway url
    withCredentials: true
})

export default api 

