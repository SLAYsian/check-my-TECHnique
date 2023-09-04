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

// router.get('/dashboard', withAuth, async (req, res) => {

// router.get('/dashboard', async (req, res) => {
// console.log("Session Data:", req.session);
// try {
//   const userData = await User.findByPk(req.session.user_id, {
//     attributes: { exclude: ['password']},
//   });

//   const user = userData.get({ plain: true });

//   const userBlogPosts = await BlogPost.findAll({
//     where: { user_id: req.session.user_id },
//     attributes: ['title', 'content', 'date_created']
//   });

//   res.render('dashboard', {
//     ...user,
//     userBlogPosts,
//     logged_in: true,
//     onDashboard: true
//   });
// } catch (err) {
//   res.status(500).json(err);
// }
// });
// 

// NOTES: Testing User data
router.get('/dashboard', withAuth, async (req, res) => {
  if (!req.session.logged_in) {
    res.send('User not logged in');
    return;
  }
  try {
    console.log(req.session.user_id);
    // const userData = await User.findByPk(req.session.user_id);
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
    });
    
    const user = userData.get({ plain: true });

    const blogData = await BlogPost.findAll({
      where: {
        user_id: req.session.user_id
      },
      raw: true
    });

    console.log("User Data:", user);
    res.render('dashboard', { 
      ...user,
      blogPosts: blogData,
      logged_in: true,
      onDashboard: true
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// NOTES: Testing withAuth ✅
// router.get('/dashboard', withAuth, async (req, res) => {
//   if (!req.session.logged_in) {
//     res.send('User not logged in');
//     return;
//   }

//   try {

//     const blogData = await BlogPost.findAll({
//       where: {
//         user_id: req.session.user_id
//       },
//       raw: true
//     });

//     res.render('dashboard', { blogPosts: blogData });
//     console.log(blogData)
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// NOTES: Testing rendering blog posts ✅
// router.get('/dashboard', async (req, res) => {
//   if (!req.session.logged_in) {
//     res.send('User not logged in');
//     return;
//   }

//   try {
//     const blogData = await BlogPost.findAll({
//       where: {
//         user_id: req.session.user_id
//       },
//       raw: true
//     });

//     res.render('dashboard', { blogPosts: blogData });
//     console.log(blogData)
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });


// NOTES: Testing fetching blog posts raw data ✅
// router.get('/dashboard', async (req, res) => {
//   if (!req.session.logged_in) {
//     res.send('User not logged in');
//     return;
//   }

//   try {
//     const blogData = await BlogPost.findAll({
//       where: {
//         user_id: req.session.user_id
//       },
//       raw: true
//     });

//     res.send(blogData);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });


// NOTES: Testing Rendering ✅
// router.get('/dashboard', (req, res) => {
//   if (!req.session.logged_in) {
//     res.send('User not logged in');
//     return;
//   }
//   res.render('dashboard');
// });

// NOTES: Testing session ✅
// router.get('/dashboard', (req, res) => {
//   if (!req.session.logged_in) {
//     res.send('User not logged in');
//     return;
//   }
//   res.send('Dashboard route for logged-in user');
// });

// NOTES: Testing Route ✅
// router.get('/dashboard', (req, res) => {
//   res.send('Dashboard route hit');
// });

// NOTES: Code if separate dashboardRoutes file
// router.get('/dashboard', (req, res) => {
//   if (req.session.logged_in) {
//     res.redirect('dashboard');
//     return;
//   } res.render('/login');
// })


// Get post form
router.get('/create', withAuth, async (req, res) => {
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
    res.redirect('/dashboard');
  } catch (err) {
    res.status(400).json(err);
  }
});

// Get blog post
router.get('/create', withAuth, async (req, res) => {
  try {
    res.render('create');
  } catch (err) {
    res.status(500).json(err);
  }
})

// Update blog post
router.put('blogposts/edit/:id', withAuth, async (req, res) => {
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