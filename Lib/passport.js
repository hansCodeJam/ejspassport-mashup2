const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/Users');
passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});
passport.use(
    'local-login',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        (req, email, password, done) => {
            User.findOne({ email: req.body.email }, (err, user) => {
                if (err) {
                    return done(err, null);
                }
                if (!user) {
                    return done(
                        null,
                        false,
                        req.flash('errorMessage', 'User not found')
                    );
                }
                bcrypt
                    .compare(password, user.password)
                    .then(result => {
                        if (!result) {
                            return done(
                                null,
                                false,
                                req.flash(
                                    'errorMessage',
                                    'Check email or password'
                                )
                            );
                        } else {
                            return done(null, user);
                        }
                    })
                    .catch(error => {
                        throw error;
                    });
            });
        }
    )
);


exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated) {
        return next();
    }
    return res.redirect('/login');
};