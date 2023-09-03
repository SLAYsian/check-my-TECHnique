const router = require('express').Router();
const { BlogPost, Comment, User } = require('../models');
const withAuth = require('../utils/auth');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const blogPostData = await BlogPost.findAll({
      include: [{
        model: User,
        as: 'creator',
        attributes: ['username']
      },
    {
      model: Comment,
      as: 'comments',
      attributes: ['comment', 'date_created'],
      include: {
        model: User,
        attributes: ['username']
      }
    }]
    });
    const blogPosts = blogPostData.map((blogPost) => blogPost.get({ plain: true }));

    res.render('homepage', {
      blogPosts
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get login or sign up page (just change the button text on the handlebars page)
router.get('/login', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('main');
    return;
  }
  res.render('login');
});

module.exports = router;