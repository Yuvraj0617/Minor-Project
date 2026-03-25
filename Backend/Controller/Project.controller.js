import Project from '../Model/Project.model.js';
const CreateProject = async (req, res)=>{
    try {
        const {title, description, technologies,isurgent,teamSize} = req.body;
        const userId=req.params.userId;
       
        const project = new Project({
            userId,
            title,
            description,
            technologies,
            isurgent,
            teamSize
        });
        await project.save();
        res.status(200).json({
            message: 'Project created successfully', data: project
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error in createProject' });
    }
}
 
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("userId", "name");
    res.json(projects);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export { CreateProject, getProjects };