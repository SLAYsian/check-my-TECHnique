const router = require('express').Router();
const { BlogPost, Comment, User } = require('../models');
const withAuth = require('../utils/auth');

// SECTION: HOME
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
      blogPosts,
      logged_in: req.session.logged_in 
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// SECTION: LOGIN/SIGNUP
// Get login page
router.get('/login', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }
  res.render('login');
});

// Get sign up page
router.get('/signup', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/dashboard');
    return;
  }
  res.render('signup');

});

// SECTION: DASHBOARD
// Get dashboard
router.get('/dashboard', withAuth, async (req, res) => {
console.log("Session Data:", req.session);
try {
  const userData = await User.findByPk(req.session.user_id, {
    attributes: { exclude: ['password']},
  });

  const user = userData.get({ plain: true });

  const userBlogPosts = await BlogPost.findAll({
    where: { user_id: req.session.user_id },
    attributes: ['title', 'content', 'date_created']
  });

  res.render('dashboard', {
    ...user,
    userBlogPosts,
    logged_in: true,
    onDashboard: true
  });
} catch (err) {
  res.status(500).json(err);
}
});
// router.get('/dashboard', (req, res) => {
//   if (req.session.logged_in) {
//     res.redirect('dashboard');
//     return;
//   } res.render('/login');
// })

// Get post form
router.get('create', withAuth, function (req, res) {
  try {
    res.render('create');
  } catch (err) {
    res.status(500).json(err);
  }
})

// Create blog post
router.post('/create', withAuth, async (req, res) => {
  try {
    const newBlogPost = await BlogPost.create({
      ...req.body,
      user_id: req.session.user_id,
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