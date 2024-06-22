import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import router from "./routes/user.route.js"


const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.use("/api", router)


export { app }

