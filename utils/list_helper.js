const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((acc, blog) => {
    return acc + blog.likes;
  }, 0);
};

const favoriteBlog = (blogs) => {
  const mostLiked = blogs.reduce((acc, blog) => {
    if (blog.likes > acc.likes) {
      acc = blog;
      return acc;
    }
    return acc;
  }, blogs[0]);
  return mostLiked || null;
};

const mostBlogs = (blogs) => {
  if (!blogs.length) return null;
  const st = {};
  blogs.forEach((blog) => (st[blog.author] = st[blog.author] + 1 || 1));
  const keys = Object.keys(st);
  return keys.reduce(
    (acc, key) => {
      if (st[key] > acc.blogs) {
        acc = { author: key, blogs: st[key] };
        return acc;
      }
      return acc;
    },
    { author: keys[0], blogs: st[keys[0]] }
  );
};

const mostLikes = (blogs) => {
  if (!blogs.length) return null;
  const st = {};
  blogs.forEach((blog) => {
    st[blog.author] = st[blog.author] + blog.likes || blog.likes;
  });
  const keys = Object.keys(st);
  return keys.reduce(
    (acc, key) => {
      if (st[key] > acc.likes) {
        acc = { author: key, likes: st[key] };
        return acc;
      }
      return acc;
    },
    { author: keys[0], likes: st[keys[0]] }
  );
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};
