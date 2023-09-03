const User = require('./User');
const BlogPost = require('./BlogPost');
const Comment = require('./Comment');

User.hasMany(BlogPost, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

User.belongsToMany(Comment, {
  foreignKey: 'user_id',
})

BlogPost.hasMany(Comment, {
  foreignKey: 'blog_post_id',
  onDelete: 'CASCADE',
});

BlogPost.belongsTo(User, {
  foreignKey: 'blog_post_id',
  onDelete: 'CASCADE',
});

Comment.belongsToMany(User, {
  foreignKey: 'comment_id',
  onDelete: 'CASCADE',
});

Comment.belongsTo(BlogPost, {
  foreignKey: 'comment_id',
  onDelete: 'CASCADE',
});

module.exports = { User, BlogPost, Comment };