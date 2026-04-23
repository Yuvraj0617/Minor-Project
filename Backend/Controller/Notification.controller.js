import Notification from "../Model/Notification.model.js";
 
export const getNotifications = async (req, res) => {
  try {
    const data = await Notification.find({ userId: req.user._id }).sort({ _id: -1 });
    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
