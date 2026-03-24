import Application from "../Model/Project_App.model.js";
import Project from "../Model/Project.model.js";
import Team from "../Model/Team.model.js";
import Notification from "../Model/Notification.model.js";


export const getApplicants = async (req, res) => {
  try {
    const { projectId } = req.params;

    const applicants = await Application.find({ projectId })
      .populate("applicantId", "name email");

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

    application.status = "accepted";
    await application.save();

    // Notify applicant
    await Notification.create({
      userId: application.applicantId,
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

    application.status = "rejected";
    await application.save();

    res.json({ message: "Rejected" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};