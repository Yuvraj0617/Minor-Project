import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
{
    type: {
        type: String,
        default: "private"
    },

    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    lastMessage: {
        type: String,
        default: ""
    }

},
{ timestamps: true }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);
export default Conversation;
