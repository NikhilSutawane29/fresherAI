
// we extract text from pdf file

import fs from "fs"
import { PDFParse } from "pdf-parse"

const extractText = async (filePath) => {
    const buffer = fs.readFileSync(filePath)

    const pdf = new PDFParse({
        data: buffer
    })

    // result is our pdf's extracted text
    const result = await pdf.getText()

    // we return our pdf's extracted text
    return result.text
}

export default extractText