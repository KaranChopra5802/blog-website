const { Router } = require("express");
const { User } = require("../models/user");
const { createHmac, randomBytes } = require("crypto");
const { createTokenforUser } = require("../services/authentication");

const router = Router();

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    const salt = user.salt;
    const hashedPassword = createHmac("sha256", salt)
      .update(password)
      .digest("hex");
    if (hashedPassword == user.password) {
      const token = createTokenforUser(user);
      console.log(token);

      return res.cookie("token", token).redirect("/");
    }
  } catch (error) {}

  return res.render("signin", {
    error: "Incorrect email or password",
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  await User.create({
    fullName,
    email,
    password,
  });
  return res.redirect("/users/signin");
});

router.get("/logout",(req,res)=>{
    res.clearCookie('token').redirect("/")
})

module.exports = router;
