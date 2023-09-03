const router = require('express').Router();
const { BlogPost, Comment, User } = require('../../models');
const withAuth = require('../../utils/auth');

// Get single blog post
router.get('/:id', async (req, res) => {
  try {
    const blogPosts = await BlogPost.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['username']
      },
    {
      model: Comment,
      as: 'comments',
      attributes: ['comment', 'createdAt'],
      include: {
        model: User,
        attributes: ['username']
      }
    }]
    });
    res.status(200).json(blogPosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Post comment
router.post('/:id/comments', withAuth, async (req,res) => {
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