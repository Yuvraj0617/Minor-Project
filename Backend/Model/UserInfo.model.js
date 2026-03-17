import mongoose from "mongoose";

const userInfoSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Institution: {
        type: String,
        required: true,
    },
    Bio: {
        type: String,
        required: false, 
    },
    About: {
        type: String,
        required: false,
    },
    Skills: {
        type: [String],
        required: false,
    },
    Github: {
        type: String,
        required: false,
    },
    LinkedIn: {
        type: String,
        required: false,
    }
});

const UserInfo = mongoose.model('UserInfo', userInfoSchema);
export default UserInfo;