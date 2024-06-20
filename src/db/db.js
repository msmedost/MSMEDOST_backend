import mongoose from "mongoose";

const connectDB = async ()=>{

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`)

        console.log("DATABASE CONNECTION IS NOW SUCCESSFUL");

    } catch (error) {
        console.log("OOPS! DATABASE CONNECTION IS UNSUCCESSFUL");
    }
}

export default connectDB