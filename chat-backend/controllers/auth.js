const bcrypt = require("bcrypt");

const { User } = require("../models");
const { generateToken } = require("../utils/jwt");

class Auth {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      let user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Invalid Credential" });
      }

      delete user.dataValues.password;

      const userWithToken = generateToken(user.get({ raw: true }));
      userWithToken.user.avatar = user.avatar;

      return res
        .status(201)
        .json({ message: "This is login screen", userWithToken });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async register(req, res) {
    try {
      let user = await User.create(req.body);

      delete user.dataValues.password;

      const userWithToken = generateToken(user.get({ raw: true }));
      userWithToken.user.avatar = user.avatar;

      return res
        .status(201)
        .json({ message: "Success Register", userWithToken });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = Auth;
