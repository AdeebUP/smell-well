const multer = require("multer")
const path = require("path")
const uuid = require("uuid").v4

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../', 'public/images'))
    },
    filename: (req, file, cb) => {
        const { originalname } = file
        cb(null, `${uuid()}-${originalname}`)
    },
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype.split('/')[0] === 'image') {
        cb(null, true)
    } else {
        cb(new Error("file is not of the correct type"), false)
    }
}
const upload = multer({ storage })

module.exports = upload
