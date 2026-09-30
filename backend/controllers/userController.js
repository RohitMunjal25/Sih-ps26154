const Project = require("../models/Project");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalProjects = await Project.countDocuments({ userId });
    const completedProjects = await Project.countDocuments({ userId, status: "completed" });
    const recentProjects = await Project.find({ userId }).select("title status createdAt").sort({ createdAt: -1 }).limit(5);

    return res.status(200).json({
      success: true,
      data: {
        user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
        statistics: { totalProjects, completedProjects },
        recentProjects,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load dashboard" });
  }
};

const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: { id: req.user._id, name: req.user.name, email: req.user.email, isEmailVerified: req.user.isEmailVerified, createdAt: req.user.createdAt },
  });
};

module.exports = { getDashboard, getProfile };