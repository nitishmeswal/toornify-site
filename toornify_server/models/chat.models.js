import mongoose, {Schema} from "mongoose";

const chatSchema = new Schema(
    {
        room: {
            type: String,
            required: true,
            index: true,
        },
        message: {
            type: String,
            required: true,
        },
        sender: {
            type: String,
            required: true,
        },
        sender_logo: {
            type: String, required: false
        },
        senderId: {
            type: String,
            ref: "User",
        },
    },
    {timestamps: true}
);

export const Chat = mongoose.model("Chat", chatSchema);