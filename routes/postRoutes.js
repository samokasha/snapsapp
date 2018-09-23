const requireAuth = require('../middlewares/requireAuth');
const mongoose = require('mongoose');

const Post = mongoose.model('Post');

module.exports = app => {
  app.post('/api/posts', requireAuth, async (req, res) => {
    const post = new Post({
      _user: req.user.id,
      title: req.body.title,
      imgUrl: req.body.imgUrl,
      tags: req.body.tags
    });

    try {
      await post.save();
      res.send(post);
    } catch (e) {
      res.status(400).send(e);
    }
  });

  app.get('/api/posts/:page', (req, res) => {
    const { page } = req.params;

    Post.find({})
      .limit(12)
      .skip(12 * page)
      .populate({
        path: '_user',
        select: 'profilePhoto displayName'
      })
      .exec((err, posts) => {
        if (err) {
          res.send(err);
        } else {
          res.send(posts);
        }
      });
  });

  app.post('/api/posts/fave/:id', requireAuth, async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        { faved: req.user.id },
        {upsert: true}
      );
      res.status(200).send({ success: 'Post faved!' });
    } catch (e) {
      res.status(400).send(e);
    }
  });
};