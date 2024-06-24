import dotenv from "dotenv"
import connectDB from "./db/db.js"
import { app } from "./app.js"

// dotenv.config({
//      path: "./env"
// });
dotenv.config();

connectDB().then(()=>{
    const port = process.env.PORT || 8000
    app.listen(port, ()=>{
        console.log("THE PORT IS RUNNING ON:", process.env.PORT);
    })
})


