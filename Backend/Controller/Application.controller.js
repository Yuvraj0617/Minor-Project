import Application from "../Model/Project_App.model.js";
import Project from "../Model/Project.model.js";
import Notification from "../Model/Notification.model.js";


export const expressInterest = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project)
      return res.status(404).json({ message: "Project not found" });

    
    if (project.userId.toString() === req.user.id)
      return res.status(400).json({ message: "Cannot apply to own project" });

    
    const exists = await Application.findOne({
      projectId,
      applicantId: req.user.id
    });

    if (exists)
      return res.status(400).json({ message: "Already applied" });

    
    const application = await Application.create({
      projectId,
      applicantId: req.user.id
    });

    
    await Notification.create({
      userId: project.userId,
      senderId: req.user.id,
      type: "interest",
      referenceId: projectId
    });

    res.json(application);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};