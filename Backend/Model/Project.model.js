import mongoose from "mongoose";
const project = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    technologies: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    teamSize: {
        type: Number,
        default: 1
    },

    status: {
        type: [String],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Project = mongoose.model('Project', project);
export default Project;