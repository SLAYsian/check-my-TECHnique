const sequelize = require('../config/connection');
const { User, BlogPost, Comment } = require('../models');
const userData = require('./userData.json');
const blogPostData = require('./blogPostData.json');
const commentData = require('./commentData.json');

const seedDatabase = async () => {
  await sequelize.sync({ force: true });

  const users = await User.bulkCreate(userData, {
    individualHooks: true,
    returning: true,
  });

  const blogPosts = await BlogPost.bulkCreate(blogPostData);

  // const comments = await Comment.bulkCreate(commentData);

  for (const blogPost of blogPostData){
    await BlogPost.create({
      ...blogPost,
      user_id: users[Math.floor(Math.random() * users.length)].id,
    });
  }

  for (const comment of commentData) {
    await Comment.create({
      ...comment,
      blog_post_id: blogPosts[Math.floor(Math.random() * blogPosts.length)].id,
      user_id: users[Math.floor(Math.random() * users.length)].id,
    });
  }
  process.exit(0);
};

seedDatabase();