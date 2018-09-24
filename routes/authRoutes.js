const passport = require('passport');
const mongoose = require('mongoose');

const requireAuth = require('../middlewares/requireAuth');
const User = mongoose.model('User');
const Faves = mongoose.model('Faves');


module.exports = app => {
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
      if (!req.user.displayName) {
        return res.redirect('/register_user');
      }
      res.redirect('/');
    }
  );

  app.get('/auth/facebook', passport.authenticate('facebook'));

  app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook'),
    (req, res) => {
      if (!req.user.displayName) {
        return res.redirect('/register_user');
      }
      res.redirect('/');
    }
  );

  app.post('/auth/register', requireAuth, async (req, res) => {
    try {
      if(req.user.registered === true) {
        return res.status(400).send({
          error: 'You have already registered.'
        });
      }
      const existingUser = await User.findOne({
        displayNameLowerC: req.body.displayName.toLowerCase()
      });

      if (existingUser) {
        return res.status(400).send({
          error: 'Display name already in use. Please choose another.'
        });
      }

      await User.findByIdAndUpdate(
        { _id: req.user.id },
        {
          displayName: req.body.displayName,
          displayNameLowerC: req.body.displayName.toLowerCase(),
          registered: true
        }
      );

      // Create and save new faves document for every newly reg'd user
      const faves = await new Faves({
        _owner: req.user.id
      }).save()

      res.redirect('/');
    } catch (e) {
      res.send({ error: 'Something went wrong. Please try again' });
    }
  });

  app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
};
