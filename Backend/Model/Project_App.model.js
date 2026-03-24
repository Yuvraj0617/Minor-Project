import mongoose from 'mongoose'

const projectAppSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

projectAppSchema.index({ projectId: 1, userId: 1 }, { unique: true });

const ProjectApp = mongoose.model('ProjectApp', projectAppSchema);
export default ProjectApp;