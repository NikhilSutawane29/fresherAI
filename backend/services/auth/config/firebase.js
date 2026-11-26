 
import { cert, initializeApp } from "firebase-admin/app"

import serviceAccount from "../serviceAccKey.json" with {type: "json"}

// we initialize app because we want to verify our token
export const app = initializeApp({
    credential: cert(serviceAccount)
})
