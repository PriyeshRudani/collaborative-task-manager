const Project = require("../models/Project");
const User = require("../models/User");

exports.createProject = async (req, res) => {
  try {
    const project = new Project({
      name: req.body.name,
      owner: req.user.id,
      members: [{ user: req.user.id, role: "admin" }],
    });

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
    }).populate("members.user", "name email");

    res.json(projects);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ msg: "Project not found" });

    const loginMember = project.members.find(
      (member) => member.user.toString() === req.user.id
    );

    if (!loginMember || loginMember.role !== "admin") {
      return res.status(401).json({ msg: "Only admin can invite members" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const alreadyMember = project.members.find(
      (member) => member.user.toString() === user.id
    );

    if (!alreadyMember) {
      project.members.push({ user: user.id, role: role || "member" });
      await project.save();
    }

    res.json(project);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
