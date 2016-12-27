'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema

mongoose.connect('mongodb://localhost:27017/chat');
var UserSchema = new Schema({
  username: String,
  password: String,
  nickname: String,
  createTime: {type: Date, default: Date.now}
});

UserSchema.methods.add = function() {
  var self = this
  return new Promise((resolve, reject) => {
    self.save(function(error, data) {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  })
};

UserSchema.methods.select = function(query) {
  var self = this
  return new Promise((resolve, reject) => {
    self.findOne(query, function(error, data) {
      console.info(error,data);
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  })
};

UserSchema.methods.findByCondition = function(query) {
  var self = this
  return new Promise((resolve, reject) => {
    self.find(query, function(error, data) {
      console.info(error,data);
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  })
};

mongoose.model('User', UserSchema)