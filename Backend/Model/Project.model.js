import mongoose from "mongoose";
 const post = new mongoose.Schema({
    title: {
        type: String,
        required: true  
    },
    description: {
        type: String,
        required: true  
    },

  });


 module.exports = mongoose.model('Project', project);