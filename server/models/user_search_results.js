var mongoose = require('mongoose');
/*
  User Search Results
  -> tracks for which search requeset
  the user is currently looking at the list
     - user_id
     - request_uri
     is the identifier

     - results (amount of results we got)
     - offset ( where he is now)
 */
var userSearchResultsSchema = mongoose.Schema({
    user_id : String,
    request_uri : String,
    results : Number,
    offset: Number

  },
  {
    timestamps: true
  }
);
var UserSearchResults = mongoose.model('UserSearchResults', userSearchResultsSchema);
module.exports = UserSearchResults;
