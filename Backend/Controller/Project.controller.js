import Project from '../Model/Project.model.js';
import UserInfo from "../Model/UserInfo.model.js";
import User from "../Model/User.model.js";

const normalizeValues = (values = []) => {
    if (!Array.isArray(values)) {
        values = [values];
    }   

    return [...new Set(
        values
            .filter(Boolean)
            .map((value) => value.toString().trim().toLowerCase())
            .filter(Boolean)
    )];
};

const calculateMatchBreakdown = (userProfile, project) => {
    const userSkills = normalizeValues(userProfile?.Skills);
    const userRoles = normalizeValues(userProfile?.Role);
    const projectRequiredSkills = normalizeValues(project?.requiredSkills);
    const projectTechnologies = normalizeValues(project?.technologies);
    const projectTypes = normalizeValues(project?.type);

    const requiredSkillMatches = projectRequiredSkills.filter((skill) => userSkills.includes(skill));
    const technologyMatches = projectTechnologies.filter((skill) => userSkills.includes(skill));
    const roleMatches = projectTypes.filter((role) => userRoles.includes(role) || userSkills.includes(role));

    const maxScore = (projectRequiredSkills.length * 5) + (projectTechnologies.length * 3) + (projectTypes.length * 2);
    const earnedScore = (requiredSkillMatches.length * 5) + (technologyMatches.length * 3) + (roleMatches.length * 2);
    const matchPercentage = maxScore === 0 ? 0 : Math.round((earnedScore / maxScore) * 100);

    return {
        score: earnedScore,
        matchPercentage,
        matchedSkills: [...new Set([...requiredSkillMatches, ...technologyMatches])],
        matchedRoles: roleMatches,
        breakdown: {
            requiredSkillMatches,
            technologyMatches,
            roleMatches
        }
    };
};

const CreateProject = async (req, res)=>{
    try {
        const {title, type, description, requiredSkills, technologies, isurgent, teamSize} = req.body;
        const userId = req.user._id;
       
        const project = new Project({
            userId,
            title,
            type,
            description,
            requiredSkills,
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
    const query = {};
    const { skill, technology, type } = req.query;

    if (technology) {
      query.technologies = technology.toLowerCase();
    }

    if (skill) {
      query.$or = [
        { requiredSkills: skill.toLowerCase() },
        { technologies: skill.toLowerCase() }
      ];
    }

    if (type) {
      query.type = type;
    }

    const projects = await Project.find(query).populate("userId", "name email");
    res.json(projects);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMatchedProjects = async (req, res) => {
  try {
    const profile = await UserInfo.findOne({ UserId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Create your profile with skills first" });
    }

    const projects = await Project.find({ userId: { $ne: req.user._id } })
      .populate("userId", "name email");

    const matchedProjects = projects
      .map((project) => {
        const match = calculateMatchBreakdown(profile, project);

        return {
          ...project.toObject(),
          matchScore: match.score,
          matchPercentage: match.matchPercentage,
          matchedSkills: match.matchedSkills,
          matchedRoles: match.matchedRoles,
          matchBreakdown: match.breakdown
        };
      })
      .filter((project) => project.matchScore > 0)
      .sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    res.status(200).json({
      total: matchedProjects.length,
      data: matchedProjects
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error in getMatchedProjects" });
  }
};

const getMatchedUsersForProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate("userId", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to view matches for this project" });
    }

    const profiles = await UserInfo.find({ UserId: { $ne: req.user._id } });

    const matchedUsers = await Promise.all(
      profiles.map(async (profile) => {
        const match = calculateMatchBreakdown(profile, project);

        if (match.score === 0) {
          return null;
        }

        const user = await User.findById(profile.UserId).select("name email createdAt");

        if (!user) {
          return null;
        }

        return {
          user,
          profile,
          matchScore: match.score,
          matchPercentage: match.matchPercentage,
          matchedSkills: match.matchedSkills,
          matchedRoles: match.matchedRoles,
          matchBreakdown: match.breakdown
        };
      })
    );

    const rankedUsers = matchedUsers
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      projectId: project._id,
      total: rankedUsers.length,
      data: rankedUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error in getMatchedUsersForProject" });
  }
};

export { CreateProject, getProjects, getMatchedProjects, getMatchedUsersForProject };
