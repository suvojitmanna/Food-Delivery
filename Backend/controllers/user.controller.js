import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: "UserId not found",
            });
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `get current user error ${error.message}`,
        });
    }
};

export const updateRole = async (req, res) => {
    try {

        const { role } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                role,
                isProfileComplete: true
            },
            {
                new: true
            }
        ).select("-password");

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};