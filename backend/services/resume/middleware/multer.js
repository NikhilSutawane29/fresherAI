
import fs from "fs"
import multer from "multer"

const uploadPath = "../uploads"

// to check our upload path is exsists or not
// if uploadPath is not exsists, so we create a directory(folder) on this path => "../uploads"
if(!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath)
}



// create a storage by using multer on upload Path for storing our files
const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, uploadPath)
    },  // dest defines where to store our file
    filename:(req, file, cb) => {
        cb(null, file.originalname)
    } // gives file name to that stored file using it's original name
})




// to check our file is in PDF type or not
const fileFilter = (req, file, cb) => {
    if(file.mimetype === "application/pdf") {
        cb(null, true)  // true decide whether we use upload middleware or not
    } else {
        cb(new Error("Only PDF files are allowed"), false)
    }
}


 
// upload middleware
export const upload = multer({
    storage,
    fileFilter,
    limits:{ // we convert our limit size from MB to Bytes
        fileSize: 20 * 1024 * 1024  // we set a limit for pdf File size is 20mb 
    }
})

