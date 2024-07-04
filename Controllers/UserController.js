const userDB = require("../models/userModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRegister = async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const createData = new userDB({ username, password: hashedPassword });
    await createData.save();
    res
      .status(201)
      .json({ data: createData, message: "User Registered successfully" });
  } catch (error) {
    res.status(501).json({ message: "registration failed" });
  }
};
const userLogin = async (req, res) => {
  try {
    const user = await userDB.findOne({ username: req.body.username });
    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    const passwordMatch = bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    const token = jwt.sign({ username: user._id }, "login", {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};
module.exports = { userRegister, userLogin };