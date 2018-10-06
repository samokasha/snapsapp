const mongoose = require('mongoose');

const requireAuth = require('../middlewares/requireAuth');
const Message = mongoose.model('Message');
const MessageBox = mongoose.model('MessageBox');

module.exports = app => {
  // Get MessageBox
  app.get('/api/message/unread', requireAuth, async (req, res) => {
    try {
      const messageBox = await MessageBox.aggregate([
        { $match: { _owner: mongoose.Types.ObjectId(req.user.id) } },
        {
          $lookup: {
            from: 'messages',
            localField: '_unread',
            foreignField: '_id',
            as: '_unread'
          }
        },
        { $unwind: '$_unread' },
        {
          $lookup: {
            from: 'users',
            localField: '_unread._from',
            foreignField: '_id',
            as: '_unread._from'
          }
        },
        { $unwind: '$_unread._from' },
        {
          $project: {
            _owner: 1,
            _unread: {
              _id: 1,
              title: 1,
              body: 1,
              replied: 1,
              // replies: 1,
              _from: { displayName: 1, profilePhoto: 1 }
            }
          }
        },
        // Roll back _unread's into array
        {
          $group: {
            _id: '$_id',
            _unread: { $push: '$_unread' },
            _owner: { $first: '$_owner' }
            // '_messages': {$first: '$_messages'}
          }
        }
      ]);

      // The easy way
      // const messageBox = await MessageBox.findOne({
      //   _owner: req.user.id
      // })
      //   .populate({ path: '_unread', select: 'title body _from' })
      //   .exec();

      // await MessageBox.populate(messageBox, {path: '_unread._from', select: 'displayName profilePhoto'});

      res.status(200).send(messageBox[0]);
    } catch (e) {
      console.log(e);
    }
  });

  // Get single message
  app.get('/api/message/get/:id', requireAuth, async (req, res) => {
    const message = await Message.findById({ _id: req.params.id }).populate({
      path: '_from _to',
      select: 'displayName profilePhoto'
    });
    // Populate
    await Message.populate(message, {
      path: 'replies._owner',
      select: 'displayName profilePhoto'
    });
    // If req.user is not the recipient or the sender = 401
    // Additional layer of security but most likely unnecessary
    const owners = [message._to._id.toString(), message._from._id.toString()];
    if (!owners.includes(req.user.id)) {
      return res
        .status(401)
        .send({ error: 'You are not authorized to view this message' });
    }
    res.status(200).send(message);
  });

  // Send a new message
  app.post(`/api/message/new/:to`, requireAuth, async (req, res) => {
    try {
      const { title, body } = req.body;
      const { to } = req.params;
      const createdAt = Date.now();
      const newMessage = await new Message({
        _from: req.user.id,
        _to: to,
        createdAt,
        title,
        body
      }).save();

      await MessageBox.findOneAndUpdate(
        { _owner: to },
        {
          $push: { _unread: newMessage._id, _messages: newMessage._id }
        }
      );
    } catch (e) {
      console.log(e);
    }
  });

  // Reply to an existing message
  app.post(`/api/message/reply/:msgId`, requireAuth, async (req, res) => {
    try {
      const { reply } = req.body;
      const message = await Message.findOneAndUpdate(
        { _id: req.params.msgId },
        { $push: { replies: reply } }
      );

      // Find the recipient
      const recipient = [
        message._from.toString(),
        message._to.toString()
      ].filter(owner => owner !== req.user.id)[0];
      // Update recipient's unread messages
      await MessageBox.findOneAndUpdate(
        { _id: recipient },
        { $addToSet: { unread: message._id } }
      );
      res.status(200).send({ success: 'Reply sent' });
    } catch (e) {
      console.log(e);
    }
  });
};
