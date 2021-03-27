const mongoose = require("mongoose");

async function validateRegistration(userInfo, collection) {
   let present = await collection.findOne({ ...userInfo });
   if (present) {
      let { Password, ...user } = present._doc;
      return user;
   } else return false;
}

module.exports = validateRegistration;
