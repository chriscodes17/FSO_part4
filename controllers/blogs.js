const blogRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const Blog = require("../models/blog");
const { tokenExtractor, userExtractor } = require("../utils/middleware");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogRouter.post(
  "/",
  tokenExtractor,
  userExtractor,
  async (request, response) => {
    const { title, author, url, likes } = request.body;
    if (!title || !url) {
      return response.status(400).json({ error: "Title or URL missing" });
    }
    const user = request.user;
    const blog = new Blog({
      title: title,
      author: author,
      url: url,
      likes: likes || 0,
      user: user._id,
    });
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    response.status(201).json(savedBlog);
  }
);

blogRouter.put("/:id", async (request, response) => {
  const body = request.body;
  const id = request.params.id;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes + 1,
  };
  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true });
  response.json(updatedBlog);
});

blogRouter.delete(
  "/:id",
  tokenExtractor,
  userExtractor,
  async (request, response) => {
    const id = request.params.id;
    const blog = await Blog.findById(id);
    const user = request.user;
    if (user._id.toString() !== blog.user.toString()) {
      return response.status(401).json({ error: "unauthorized action" });
    }
    await Blog.findByIdAndRemove(id);
    response.status(204).end();
  }
);

module.exports = blogRouter;
