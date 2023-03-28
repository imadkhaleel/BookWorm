const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

async function authenticateUser(email, password, done, getUserByEmail) {
  const user = await getUserByEmail(email);
  if (!user) {
    return done(null, false, { message: 'No user with that email' });
  }

  try {
    if (await bcrypt.compare(password, user.password)) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Incorrect Password.' });
    }
  } catch (m) {
    return done(m);
  }
}

async function serializeUser(user, done) {
  done(null, user.id);
}

async function deserializeUser(id, done, getUserById) {
  const user = await getUserById(id);
  done(null, user);
}

function initialize(passport, getUserByEmail, getUserById) {
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) =>
    authenticateUser(email, password, done, getUserByEmail)
  ));

  passport.serializeUser(serializeUser);
  passport.deserializeUser((id, done) => deserializeUser(id, done, getUserById));
}

module.exports = initialize;


