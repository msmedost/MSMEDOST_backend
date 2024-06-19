import dotenv from "dotenv"
import connectDB from "./db/db.js"
import { app } from "./app.js"

dotenv.config({
     path: "./env"
});

connectDB().then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log("THE PORT IS RUNNING ON:", process.env.PORT);
    })
})