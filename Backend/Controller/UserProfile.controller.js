import UserInfo from "../Model/UserInfo.model.js";

const CreateUserProfile = async (req, res) => {
    try {
        const { Institution, Bio, About, Skills, Github, LinkedIn } = req.body;
        const userId =  req.params.userId;
      
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }   
        const newUserInfo = new UserInfo({
            UserId: userId,
            Institution:Institution,
            Bio:Bio,
            About:About,
            Skills:Skills,
            Github:Github,
            LinkedIn:LinkedIn
        });
        await newUserInfo.save();
        res.status(201).json({ 
            message: 'User profile created',
         });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error in createUserProfile' });
     }
    
};

const GetUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
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

const UpdateUserProfile = async (req, res) => {}

export { CreateUserProfile, GetUserProfile, UpdateUserProfile };