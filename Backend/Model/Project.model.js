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
    type:{
        type: [String],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requiredSkills: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    technologies: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    teamSize: {
        type: Number,
        default: 1
    },
    isurgent: {
        type: Boolean,
        default: false
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Project = mongoose.model('Project', project);
export default Project;
