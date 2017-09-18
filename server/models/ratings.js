var mongoose = require('mongoose');

var ratingsSchema = mongoose.Schema({
    user_id : String,
    slug : String,
    data_id : String,
    rating : Number,
    description: String,
    request_uri: String,
    url: String,
    name: String,
    publisher: String,
    search_rank: String,
    portal: String,
    geolocation: String
  },
  {
    timestamps: true
  }
);
var Ratings = mongoose.model('Ratings', ratingsSchema);
module.exports = Ratings;
