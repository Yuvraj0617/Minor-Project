import Conversation from "../Model/Conversation.model.js";
import { sdkAppId, generateUserSig } from "../Config/tencentConnect.js";


// Generate Tencent Login Token
const getChatToken = async (req, res) => {
    try {

        const userId = req.user._id;

        const userSig = generateUserSig(userId);

        res.status(200).json({
            sdkAppId,
            userId,
            userSig
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to generate token"
        });
    }
};


// Create Private Chat
const createConversation = async (req, res) => {
    try {

        const myId = req.user._id;
        const targetId = req.params.id;

        if (myId.toString() === targetId.toString()) {
            return res.status(400).json({ message: "Cannot create chat with yourself" });
        }

        let chat = await Conversation.findOne({
            members: { $all: [myId, targetId] }
        });

        if (!chat) {
            chat = await Conversation.create({
                members: [myId, targetId]
            });
        }

        res.status(200).json(chat);

    } catch (error) {
        res.status(500).json({
            message: "Conversation create failed"
        });
    }
};


// My Chat List
const getMyConversations = async (req, res) => {
    try {

        const myId = req.user._id;

        const chats = await Conversation.find({
            members: myId
        })
        .populate("members", "name email")
        .sort({ updatedAt: -1 });

        res.status(200).json(chats);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch chats"
        });
    }
};

export { getChatToken, createConversation, getMyConversations };
