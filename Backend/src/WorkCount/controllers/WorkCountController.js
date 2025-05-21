import AssignWork from "../../AssignWork/models/AssignWorkModel.js";

// Get counts for all work assignments (total, completed, pending, in-progress)
export const getWorkCounts = async (req, res) => {
  try {
    // Get total count of all assignments
    const totalAssigned = await AssignWork.countDocuments();

    // Get count of completed assignments
    const completed = await AssignWork.countDocuments({ status: "Completed" });

    // Get count of pending assignments
    const pending = await AssignWork.countDocuments({ status: "Pending" });

    // Get count of in-progress assignments
    const inProgress = await AssignWork.countDocuments({
      status: "In Progress",
    });

    res.status(200).json({
      counts: {
        totalAssigned,
        completed,
        pending,
        inProgress,
      },
    });
  } catch (error) {
    console.error("Error getting work counts:", error);
    res.status(500).json({
      message: "Failed to get work counts",
      error: error.message,
    });
  }
};

// Get counts for a specific user's work assignments
export const getUserWorkCounts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get total count of user's assignments
    const totalAssigned = await AssignWork.countDocuments({
      $or: [{ teamMembers: userId }, { students: userId }],
    });

    // Get count of completed assignments
    const completed = await AssignWork.countDocuments({
      $or: [{ teamMembers: userId }, { students: userId }],
      status: "Completed",
    });

    // Get count of pending assignments
    const pending = await AssignWork.countDocuments({
      $or: [{ teamMembers: userId }, { students: userId }],
      status: "Pending",
    });

    // Get count of in-progress assignments
    const inProgress = await AssignWork.countDocuments({
      $or: [{ teamMembers: userId }, { students: userId }],
      status: "In Progress",
    });

    res.status(200).json({
      counts: {
        totalAssigned,
        completed,
        pending,
        inProgress,
      },
    });
  } catch (error) {
    console.error("Error getting user work counts:", error);
    res.status(500).json({
      message: "Failed to get user work counts",
      error: error.message,
    });
  }
};
