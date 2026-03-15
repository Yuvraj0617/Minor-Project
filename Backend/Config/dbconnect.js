import mongoose from "mongoose";
const connectDB =  async() => {  
    try { 
        await mongoose.connect(process.env.DB_URI);
        console.log("Connected to MongoDB successfully");
    }
        catch (error) { 
            console.error(error);
            process.exit(1);
        }
}

export default connectDB;