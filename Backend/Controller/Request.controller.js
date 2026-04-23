import Application from "../Model/Project_App.model.js";
import Project from "../Model/Project.model.js";
import Team from "../Model/Team.model.js";
import Notification from "../Model/Notification.model.js";


export const getApplicants = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to view applicants" });
    }

    const applicants = await Application.find({ projectId })
      .populate("userId", "name email");

    res.json(applicants);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);
    if (!application)
      return res.status(404).json({ message: "Not found" });

    const project = await Project.findById(application.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to accept this application" });
    }

    application.status = "accepted";
    await application.save();

    const existingTeamMember = await Team.findOne({
      projectId: application.projectId,
      userId: application.userId
    });

    if (!existingTeamMember) {
      await Team.create({
        projectId: application.projectId,
        userId: application.userId
      });
    }

    await Notification.create({
      userId: application.userId,
      type: "acceptance",
      referenceId: application.projectId
    });

    res.json({ message: "Accepted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Not found" });
    }

    const project = await Project.findById(application.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to reject this application" });
    }

    application.status = "rejected";
    await application.save();

    await Notification.create({
      userId: application.userId,
      type: "rejection",
      referenceId: application.projectId
    });

    res.json({ message: "Rejected" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
