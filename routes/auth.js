var mongoosedb = require('.././mongoosedb.js');

exports.authenticateFBUser = function(accessToken, refreshToken, profile, done) {

  mongoosedb.User.findOne({'accounts.uid': profile.id, 'accounts.provider':'facebook'}, function(err, existingUser) {
    if(existingUser){
      done(null, existingUser);
    } else {
      var newUser = new mongoosedb.User();
      var account = {provider: "facebook", uid: profile.id};
      newUser.accounts.push(account);
      newUser.firstname = profile.name.givenName;
      newUser.lastname = profile.name.familyName;
      newUser.email = "joe@123fakesite.com";
      newUser.save(function(err){
        if(err) {throw err;}
        done(null, newUser);
      });
    }
  });
}