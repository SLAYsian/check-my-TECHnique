const router = require('express').Router();
const { BlogPost, User } = require('../../models');
const withAuth = require('../../utils/auth');

// Get dashboard
router.get('/', withAuth, async (req, res) => {
  try {
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password']},
    });

    const user = userData.get({ plain: true });

    const userBlogPosts = await BlogPost.findAll({
      where: { user_id: req.session.user.id },
      attributes: ['title', 'content', 'date_created']
    });

    res.render('dashboard', {
      ...user,
      userBlogPosts,
      logged_in: true,
      onDashboard: true
    });
  } catch (err) {
    res.render(500).json(err);
  }
});

// Create blog post
router.post('/blogposts', withAuth, async (req, res) => {
  try {
    const newBlogPost = await BlogPost.create({
      ...req.body,
      user_id: req.session.user.id,
    });

    res.status(200).json(newBlogPost);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Update blog post
router.put('blogposts/:id', withAuth, async (req, res) => {
  try {
    const blogPost = await BlogPost.update(
      {
        title: req.body.title,
        content: req.body.content,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json(blogPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//  Delete blog post
router.delete('blogposts/:id', withAuth, async (req, res) => {
  try {
    const blogPostData = await BlogPost.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (!blogPostData) {
      res.status(404).json({ message: 'No post found with this id!' });
      return;
    }

    res.status(200).json(blogPostData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
