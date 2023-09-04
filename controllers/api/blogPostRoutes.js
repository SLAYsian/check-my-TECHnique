const router = require('express').Router();
const { BlogPost, Comment, User } = require('../../models');
const withAuth = require('../../utils/auth');

// Get single blog post
router.get('/:id', async (req, res) => {
  try {
    const blogPostData = await BlogPost.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['username', 'id'],
        foreignKey: 'user_id'
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

    if (!blogPostData) {
      res.status(404).send('Blog post not found!');
      return;
    }

    const blogPost = blogPostData.get({ plain: true });
    res.render('blogpost', { 
      ...blogPost,
      onDashboard: req.session.user_id === blogPost.creator.id
    });
    console.log("Logged-in user:", req.session.user_id);
    console.log("Blog post creator:", blogPost.creator.id);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Post comment
router.post('/:id', withAuth, async (req,res) => {
  try {
    const blogPost = await BlogPost.findByPk(req.params.id);
    if (!blogPost) {
      res.status(404).json({ message: 'No post found with this id!' });
      return;
    }

    const newComment = await Comment.create({
      comment: req.body.comment,
      date_created: req.body.date_created,
      user_id: req.session.user_id,
      blog_post_id: req.params.id
  });

  res.redirect(`/api/blogposts/${req.params.id}`);

    } catch (err) {
      res.status(500).json(err);
    }
});

// Update blog post
router.put('/:id', withAuth, async (req, res) => {
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
    res.redirect('/dashboard');
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete route
router.delete('/:id', withAuth, async (req, res) => {
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
    res.redirect('/dashboard');
    // res.status(200).json(blogPostData);
  } catch (err) {
    res.status(500).json(err);
  }
});



module.exports = router;