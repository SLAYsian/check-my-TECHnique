const router = require('express').Router();
const { BlogPost, Comment, User } = require('../../models');
const withAuth = require('../../utils/auth');

// Get single blog post
router.get('/:id', async (req, res) => {
  console.log("Blog post route reached!")
  try {
    const blogPostData = await BlogPost.findByPk(req.params.id, {
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

    if (!blogPostData) {
      res.status(404).send('Blog post not found!');
      return;
    }

    const blogPost = blogPostData.get({ plain: true });
    res.render('blogpost', { 
      ...blogPost,
      onDashboard: req.session.user_id === blogPost.creator.id
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// router.get('/:id', async (req, res) => {
//   try {
//     const blogPosts = await BlogPost.findByPk(req.params.id, {
//       include: [{
//         model: User,
//         as: 'creator',
//         attributes: ['username']
//       },
//     {
//       model: Comment,
//       as: 'comments',
//       attributes: ['comment', 'date_created'],
//       include: {
//         model: User,
//         attributes: ['username']
//       }
//     }]
//     });
//     res.status(200).json(blogPosts);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

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

      res.status(200).json(newComment);

    } catch (err) {
      res.status(500).json(err);
    }
});

module.exports = router;