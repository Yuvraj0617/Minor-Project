import UserInfo from "../Model/UserInfo.model.js";

const CreateUserProfile = async (req, res) => {
    try {
        const { Institution, Bio, Role, Skills, Github, LinkedIn } = req.body;
        const userId = req.user._id;
      
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const profile = await UserInfo.findOneAndUpdate(
            { UserId: userId },
            {
                UserId: userId,
                Institution,
                Bio,
                Role,
                Skills,
                Github,
                LinkedIn
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(201).json({ 
            message: 'User profile created',
            data: profile
         });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error in createUserProfile' });
     }
    
};

const GetUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.user?._id;
        const userInfo = await UserInfo.findOne({ UserId: userId });
        if (!userInfo) {
            return res.status(404).json({ message: 'User profile not found' });
        }
        res.status(200).json({ data: userInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error in getUserProfile' });
    }
};

const UpdateUserProfile = async (req, res) => {
    try {
        const { Institution, Bio, Role, Skills, Github, LinkedIn } = req.body;
        const profile = await UserInfo.findOneAndUpdate(
            { UserId: req.user._id },
            { Institution, Bio, Role, Skills, Github, LinkedIn },
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({ message: "User profile not found" });
        }

        res.status(200).json({ message: "User profile updated", data: profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error in updateUserProfile' });
    }
}

export { CreateUserProfile, GetUserProfile, UpdateUserProfile };
