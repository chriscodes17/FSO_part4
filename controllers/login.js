const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body;
  const user = await User.findOne({ username });
  const checkPassword =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);
  if (!(user && checkPassword)) {
    return response.status(401).json({ error: "invalid username or password" });
  }
  const useForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(useForToken, process.env.SECRET);
  response.status(200).json({ token, username: user.username });
});

module.exports = loginRouter;
