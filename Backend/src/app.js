const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

const parseOrigins = () => {
    const raw = process.env.CLIENT_ORIGIN || "http://localhost:5173"
    return raw.split(",").map((s) => s.trim()).filter(Boolean)
}

const allowedOrigins = parseOrigins()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true)
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(null, false)
    },
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)



module.exports = app