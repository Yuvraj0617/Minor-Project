import mongoose from 'mongoose'
const teamSchema = new mongoose.Schema({
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

  role: {
    type: String,
    default: 'member'
  }
  ,
  createdAt: {
    type: Date,
    default: Date.now
  }
}
);

const Team = mongoose.model('Team', teamSchema);
export default Team;
