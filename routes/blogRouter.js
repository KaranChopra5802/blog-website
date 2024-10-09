const { Router } = require("express");
const multer = require("multer");
const router = Router();
const path = require("path");
const Blog = require("../models/blog");
const { comment, Comment } = require("../models/comment");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + "-" + `${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.post("/", upload.single("coverImageUrl"), async (req, res) => {
  const blog = await Blog.create({
    title: req.body.title,
    body: req.body.body,
    coverImageUrl: `/uploads/${req.file.filename}`,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${blog.id}`);
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({"blogId" : req.params.id}).populate("createdBy");
  console.log(comments)
  return res.render("blog", {
    user: req.user,
    blog,
    comments
  });
});

router.post("/comment/:blogId", async (req, res) => {
  const { content } = req.body;
  const comment = await Comment.create({
    content,
    blogId : req.params.blogId,
    createdBy: req.user._id
  });

  res.redirect(`/blog/${req.params.blogId}`)
});
module.exports = router;
