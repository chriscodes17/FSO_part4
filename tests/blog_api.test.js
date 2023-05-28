const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
  },
];

describe("When there are a few blogs in the db", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    for (let blog of initialBlogs) {
      let blogObject = new Blog(blog);
      await blogObject.save();
    }
  });

  test("blogs are returned as json in the response", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-type", /application\/json/);
  });

  test("verify that returned object has an identifier property named id", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body[0].id).toBeDefined();
  });

  test("adding a valid blog is successful", async () => {
    const newBlog = {
      title: "How to live happy",
      author: "John Doe",
      url: "http://happylife.com",
      likes: 0,
    };
    let token = "";
    const loginResponse = await api
      .post("/api/login")
      .send({ username: "Lucy", password: "password" });
    token = loginResponse._body.token;
    await api
      .post("/api/blogs")
      .send(newBlog)
      .set({ Authorization: `Bearer ${token}` })
      .expect(201)
      .expect("Content-type", /application\/json/);

    const updatedBlogs = await api.get("/api/blogs");
    expect(updatedBlogs.body).toHaveLength(initialBlogs.length + 1);
    const blogTitles = updatedBlogs.body.map((blog) => blog.title);
    expect(blogTitles).toContain("How to live happy");
  });

  test("adding a blog without a auth token returns a 401 status code", async () => {
    const newBlog = {
      title: "How to live happy",
      author: "John Doe",
      url: "http://happylife.com",
      likes: 0,
    };
    await api.post("/api/blogs").send(newBlog).expect(401);
  });

  test("if likes property is missing in request body, verify that defualt val is 0", async () => {
    const newBlog = {
      title: "Coding is fun!",
      author: "chris j",
      url: "google.com",
    };
    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-type", /application\/json/);

    const response = await api.get("/api/blogs");
    const blogs = response.body;
    expect(blogs[2].likes).toBe(0);
  });

  test("status 400 if title or url missing", async () => {
    const newBlog = {
      title: "This has a title",
      author: "CJ",
      likes: 89,
    };

    await api.post("/api/blogs").send(newBlog).expect(400);

    const response = await api.get("/api/blogs");
    const blogs = response.body;
    expect(blogs).toHaveLength(initialBlogs.length);
  });

  test("deleting a single blog post is successful", async () => {
    const initialResponse = await api.get("/api/blogs");
    const blogToRemove = initialResponse.body[0];
    await api.delete(`/api/blogs/${blogToRemove.id}`).expect(204);

    const finalResponse = await api.get("/api/blogs");
    const finalBlogs = finalResponse.body;
    expect(finalBlogs).toHaveLength(initialBlogs.length - 1);
  });

  test("updating the information of an individual blog", async () => {
    const initialResponse = await api.get("/api/blogs");
    const blogToUpdate = initialResponse.body[0];
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
      .expect("Content-type", /application\/json/);
    const finalResponse = await api.get("/api/blogs");
    expect(finalResponse.body[0].likes).toBe(initialBlogs[0].likes + 1);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});

describe("When there is one user in the database", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash("password", 10);
    const user = new User({ username: "Lucy", passwordHash });
    await user.save();
  });
  test("creation is successfull of a new user", async () => {
    const usersAtStart = await User.find({});
    const newUser = {
      username: "Arya_woof",
      name: "Arya De Dog",
      password: "woof123woof",
    };
    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-type", /application\/json/);
    const usersAtEnd = await User.find({});
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);
    const usernames = usersAtEnd.map((user) => user.username);
    expect(usernames).toContain(newUser.username);
  });
  test("creation fails when username already exsists in db", async () => {
    const newUser = {
      username: "Lucy",
      name: "Lucy Cat",
      password: "laskdjh",
    };
    await api.post("/api/users").send(newUser).expect(400);
  });
  test("creation fails when username is less than 3 chars long", async () => {
    const newUser = {
      username: "lo",
      name: "akj",
      password: "akjshdg",
    };
    await api.post("/api/users").send(newUser).expect(400);
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
});
