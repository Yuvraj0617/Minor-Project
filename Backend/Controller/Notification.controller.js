import Notification from "../Model/Notification.model.js";
 
export const getNotifications = async (req, res) => {
  try {
    const data = await Notification.find({ userId: req.user.id });
    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};